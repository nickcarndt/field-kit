#!/usr/bin/env python3
"""Compile patterns/*.md into skills/*/SKILL.md.

Skills are BUILT, never edited: the pattern files stay the single source of
truth and drift is structurally impossible. Rerun after any pattern edit;
git diff then shows exactly what changed downstream.
"""

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
# Reuse the server's parser — same contract, same loud failures, and no
# second markdown-parsing implementation to drift from the first.
sys.path.insert(0, str(REPO / "server"))

from mcp_server.catalog import Pattern, load_catalog  # noqa: E402


def one_line(text: str) -> str:
    return " ".join(text.split())


def render(p: Pattern) -> str:
    front = [
        "---",
        f"name: {p.id.lower()}-{p.slug}",
        # json.dumps = a YAML-safe quoted scalar; descriptions contain
        # commas, dashes, and could grow a colon someday.
        f"description: {json.dumps(one_line(p.description), ensure_ascii=False)}",
        "---",
        "",
    ]
    body = [f"# {p.id} · {p.name}", "", p.framing, ""]
    for heading, text in p.sections.items():
        body += [f"## {heading}", "", text, ""]
    cites = ["---", "", "Grounded in:", ""]
    for g in p.grounded_in:
        line = f"- {g.source} — {g.authors}"
        if g.date:
            line += f" ({g.date})"
        if g.url:
            line += f" — {g.url}"
        cites.append(line)
    return "\n".join(front + body + cites) + "\n"


def main() -> None:
    catalog = load_catalog(REPO / "patterns")
    for p in catalog.values():
        out_dir = REPO / "skills" / f"{p.id.lower()}-{p.slug}"
        out_dir.mkdir(parents=True, exist_ok=True)
        content = render(p)
        (out_dir / "SKILL.md").write_text(content, encoding="utf-8")
        approx_tokens = int(len(content.split()) * 4 / 3)
        print(f"{out_dir.relative_to(REPO)}/SKILL.md  ~{approx_tokens} tokens")


if __name__ == "__main__":
    main()
