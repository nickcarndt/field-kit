"""FK-05 made callable: anchored scores in, maturity profile + routed roadmap out.

Deterministic on purpose — the checkable half of the assessment (band
scoring, gap routing) lives in code. The judgment half (scoring free-text
answers against the anchors) belongs to a rubric'd judge in the web flow,
per the pattern's own eval plan. Axes and routing come from whichever
pattern declares `axes` in its frontmatter; this module names no patterns.
"""

from __future__ import annotations

from statistics import mean

from mcp_server.catalog import Pattern

# Anchored bands over the 0-3 scale. An axis below GAP_BELOW lands on the
# roadmap; at or above it, the practice can defer that axis to the next
# quarterly review.
LEVELS = ((1.0, "nascent"), (2.0, "emerging"), (2.75, "established"), (3.01, "production-ready"))
GAP_BELOW = 2.0


def _level(score: float) -> str:
    return next(label for cutoff, label in LEVELS if score < cutoff)


def assess_readiness(
    catalog: dict[str, Pattern], answers: dict[str, list[int]]
) -> dict[str, object]:
    assessment = next((p for p in catalog.values() if p.axes), None)
    if assessment is None:
        raise ValueError("no pattern in this catalog declares assessment axes")

    valid = [a.key for a in assessment.axes]
    unknown = sorted(set(answers) - set(valid))
    missing = [k for k in valid if k not in answers]
    if unknown or missing:
        raise ValueError(
            f"answers must cover exactly these axes: {valid} "
            f"(missing: {missing or 'none'}; unknown: {unknown or 'none'})"
        )

    profile = []
    for ax in assessment.axes:
        scores = answers[ax.key]
        # bool is an int subclass in Python: without the explicit exclusion,
        # true/false would sneak through as 1/0 and score the practice.
        if not scores or not all(
            isinstance(v, int) and not isinstance(v, bool) and 0 <= v <= 3 for v in scores
        ):
            raise ValueError(
                f"axis {ax.key!r}: scores must be a non-empty list of integers 0-3, "
                "one per anchored questionnaire item"
            )
        # Band on the true mean; round only for display — otherwise a mean
        # of 1.997 rounds to 2.0 and silently clears the gap line.
        raw = mean(scores)
        profile.append(
            {"axis": ax.key, "name": ax.name, "score": round(raw, 2),
             "level": _level(raw), "_raw": raw}
        )

    # Weakest first: the roadmap is a priority order, not a checklist.
    gaps = sorted((e for e in profile if e["_raw"] < GAP_BELOW), key=lambda e: e["_raw"])
    for e in profile:
        del e["_raw"]
    routes = {a.key: a.routes_to for a in assessment.axes}
    roadmap = [
        {
            "axis": e["axis"],
            "score": e["score"],
            "level": e["level"],
            "pattern": (p := catalog[routes[e["axis"]]]).id,
            "pattern_name": p.name,
            "kills": p.kills,
            "reason": f"{e['name']} scored {e['score']} ({e['level']}) — "
                      f"start with {p.id}: {p.thesis}",
        }
        for e in gaps
    ]

    return {
        "profile": profile,
        "roadmap": roadmap,
        "method": "deterministic anchored scoring (0-3 per item, mean per axis); "
                  f"axes below {GAP_BELOW} route to patterns per the assessment "
                  "pattern's own frontmatter",
        **({} if roadmap else {"note": "no axis below the gap line — revisit at the next quarterly review"}),
    }
