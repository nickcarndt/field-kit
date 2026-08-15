"""The demo tool: a plain-English use case in, ranked part numbers out.

Deterministic on purpose — FK-01's thesis applied to ourselves. The rubric is
auditable keyword scoring that shows its evidence; the calling model adds the
narrative. No API key, no extra latency, identical answer every run.

The tool knows no pattern names. Matching reads `triggers`, companionship
reads `pairs_with_all` (FK-03 declares it), the zero-match fallback reads
`fallback` (FK-05 declares it). All policy lives in the pattern files.
"""

from __future__ import annotations

import re

from mcp_server.catalog import Pattern


def _hits(use_case: str, triggers: list[str]) -> list[str]:
    # Left-word-boundary prefix match, per the contract in fk-01's comment:
    # "claim" catches "claims-processing"; "api" never fires inside "capital".
    return [t for t in triggers if re.search(r"\b" + re.escape(t), use_case, re.IGNORECASE)]


def _entry(p: Pattern, matched: list[str], reason: str) -> dict[str, object]:
    return {
        "id": p.id,
        "name": p.name,
        "thesis": p.thesis,
        "kills": p.kills,
        "matched_triggers": matched,
        "reason": reason,
    }


def recommend_pattern(catalog: dict[str, Pattern], use_case: str) -> dict[str, object]:
    scored = []
    for p in catalog.values():
        if p.pairs_with_all:
            continue  # companions join a result; they don't compete for rank
        if matched := _hits(use_case, p.triggers):
            scored.append((p, matched))
    # Hit count ranks; id breaks ties so equal scores return in catalog order
    # and the same question never shuffles its answer between runs.
    scored.sort(key=lambda pm: (-len(pm[1]), pm[0].id))

    recommendations = [
        _entry(p, m, f"matched trigger(s): {', '.join(m)}") for p, m in scored
    ]

    if recommendations:
        recommendations += [
            _entry(p, [], "recommended on every engagement — this pattern's own "
                          "'when not to use' is 'never'")
            for p in catalog.values() if p.pairs_with_all
        ]
    else:
        # The fallback stands alone: with nothing matched there is no
        # engagement for a companion to gate yet — triage comes first.
        recommendations = [
            _entry(p, [], "no strong trigger match — restate the use case with "
                          "more domain detail, or start with a readiness "
                          "assessment to locate the right pattern")
            for p in catalog.values() if p.fallback
        ]

    return {
        "use_case": use_case,
        "recommendations": recommendations,
        "method": "deterministic trigger rubric: word-boundary prefix match, "
                  "ranked by hit count; see matched_triggers for the evidence",
    }
