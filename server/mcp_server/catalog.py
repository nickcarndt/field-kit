"""The one parser: patterns/*.md → typed Pattern records.

Every tool reads from this module and none of them parse markdown, so the
frontmatter contract (documented in fk-01's post-frontmatter comment) is
enforced in exactly one place. A malformed pattern file fails here, at
startup, with the filename in the error — never mid-demo inside a tool call.
"""

from __future__ import annotations

import re
from pathlib import Path

import yaml
from pydantic import BaseModel, ConfigDict, field_validator

# The body contract: eight H2s, this text, this order. Enforced rather than
# discovered so a renamed heading breaks the build, not get_pattern's output.
EXPECTED_SECTIONS = (
    "Problem scene",
    "When to use / when not to",
    "Architecture",
    "Eval plan",
    "Where this breaks in the field",
    "The objection this kills",
    "Live exemplar",
    "Workshop outline (90 minutes)",
)


class CatalogError(Exception):
    """A pattern file violates the contract. Always includes the filename."""


class Exemplar(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    url: str | None = None


class GroundedIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source: str
    authors: str
    principle: str
    url: str | None = None
    # Kept as a string on purpose: bare YAML dates parse to datetime.date and
    # break JSON serialization, so the contract requires quoting them.
    date: str | None = None

    @field_validator("date", mode="before")
    @classmethod
    def _date_must_be_quoted(cls, v: object) -> object:
        if v is not None and not isinstance(v, str):
            raise ValueError(
                f"got {type(v).__name__} — quote dates in frontmatter (date: \"2024-12-19\")"
            )
        return v


class Axis(BaseModel):
    model_config = ConfigDict(extra="forbid")
    key: str
    name: str
    routes_to: str


class Pattern(BaseModel):
    # extra="forbid" makes the model the schema: a typo'd or undocumented
    # frontmatter field in a future FK-06 fails at startup instead of being
    # silently ignored forever.
    model_config = ConfigDict(extra="forbid")

    id: str
    slug: str
    name: str
    thesis: str
    kills: str
    taxonomy: str
    description: str
    triggers: list[str]
    exemplars: list[Exemplar]
    grounded_in: list[GroundedIn]
    pairs_with_all: bool = False
    fallback: bool = False
    axes: list[Axis] = []
    framing: str
    sections: dict[str, str]

    @field_validator("triggers")
    @classmethod
    def _triggers_are_lowercase_stems(cls, v: list[str]) -> list[str]:
        bad = [t for t in v if t != t.lower() or not t.strip()]
        if bad:
            raise ValueError(f"triggers must be non-empty lowercase stems, got {bad}")
        return v


def _parse_file(path: Path) -> Pattern:
    text = path.read_text(encoding="utf-8")

    parts = text.split("---", 2)
    if len(parts) < 3 or parts[0].strip():
        raise CatalogError(f"{path.name}: no frontmatter block")
    frontmatter, body = yaml.safe_load(parts[1]), parts[2]

    # Contract: parsers anchor on the H1 and drop everything above it, so the
    # author-note HTML comments between frontmatter and title never leak into
    # any surface.
    h1 = re.search(r"^# .+$", body, re.MULTILINE)
    if not h1:
        raise CatalogError(f"{path.name}: no H1 title")
    body = body[h1.end():]

    chunks = re.split(r"^## (.+)$", body, flags=re.MULTILINE)
    framing, pairs = chunks[0].strip(), list(zip(chunks[1::2], chunks[2::2]))
    if not framing:
        raise CatalogError(f"{path.name}: missing framing paragraph between H1 and first H2")

    headings = tuple(h.strip() for h, _ in pairs)
    if headings != EXPECTED_SECTIONS:
        raise CatalogError(
            f"{path.name}: H2 sections {headings} != contract {EXPECTED_SECTIONS}"
        )

    try:
        return Pattern(
            **frontmatter,
            framing=framing,
            sections={h.strip(): b.strip() for h, b in pairs},
        )
    except Exception as e:  # pydantic's error already names the bad field
        raise CatalogError(f"{path.name}: {e}") from e


def load_catalog(patterns_dir: Path) -> dict[str, Pattern]:
    """Parse every pattern file; return records keyed by catalog id.

    Takes the directory as a parameter — where patterns live is config's
    knowledge, not this module's, which keeps catalog.py a pure function
    the tests can point at fixture directories.
    """
    files = sorted(patterns_dir.glob("fk-*.md"))
    if not files:
        raise CatalogError(f"no pattern files found in {patterns_dir}")
    patterns = [_parse_file(p) for p in files]
    catalog = {p.id: p for p in patterns}
    # Cross-file references only checkable once everything is loaded: an
    # axis routing to a renamed or deleted pattern dies here, at startup.
    for p in patterns:
        for ax in p.axes:
            if ax.routes_to not in catalog:
                raise CatalogError(
                    f"{p.id}: axis {ax.key!r} routes to unknown pattern {ax.routes_to!r}"
                )
    return catalog
