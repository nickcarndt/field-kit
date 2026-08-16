"""Golden profiles, the flattery test, and loud failures for FK-05's tool."""

import shutil
import tempfile
from pathlib import Path

import pytest

from mcp_server.catalog import CatalogError, load_catalog
from mcp_server.tools.assess_readiness import assess_readiness

PATTERNS = Path(__file__).resolve().parents[2] / "patterns"
CATALOG = load_catalog(PATTERNS)

STRONG = {"delivery": [3, 3, 2], "evals": [3, 2, 3], "governance": [2, 3, 3], "claude_fluency": [3, 3, 3]}


class TestProfiles:
    def test_strong_practice_gets_empty_roadmap_and_a_note(self):
        r = assess_readiness(CATALOG, STRONG)
        assert r["roadmap"] == []
        assert "quarterly" in r["note"]

    def test_weak_practice_scores_weak(self):
        # The flattery test as a fixture: a weak practice MUST profile weak.
        r = assess_readiness(CATALOG, {k: [0, 1, 0] for k in STRONG})
        assert all(e["level"] in ("nascent", "emerging") for e in r["profile"])
        assert len(r["roadmap"]) == 4

    def test_weak_governance_routes_to_fk04_first(self):
        answers = {**STRONG, "governance": [0, 0, 1]}
        r = assess_readiness(CATALOG, answers)
        assert r["roadmap"][0]["pattern"] == "FK-04"
        assert "FK-04" in r["roadmap"][0]["reason"]

    def test_roadmap_orders_weakest_first(self):
        answers = {**STRONG, "evals": [1, 1, 1], "delivery": [0, 0, 0]}
        r = assess_readiness(CATALOG, answers)
        assert [g["pattern"] for g in r["roadmap"]] == ["FK-01", "FK-03"]

    def test_deterministic(self):
        assert assess_readiness(CATALOG, STRONG) == assess_readiness(CATALOG, STRONG)


class TestLoudFailures:
    def test_unknown_axis_named_in_error(self):
        with pytest.raises(ValueError, match="unknown.*vibes"):
            assess_readiness(CATALOG, {**STRONG, "vibes": [3]})

    def test_missing_axis_named_in_error(self):
        answers = dict(STRONG); del answers["evals"]
        with pytest.raises(ValueError, match="missing.*evals"):
            assess_readiness(CATALOG, answers)

    def test_out_of_range_score_rejected(self):
        with pytest.raises(ValueError, match="0-3"):
            assess_readiness(CATALOG, {**STRONG, "delivery": [5]})

    def test_booleans_rejected(self):
        with pytest.raises(ValueError, match="0-3"):
            assess_readiness(CATALOG, {**STRONG, "delivery": [True, True]})

    def test_axis_routing_to_unknown_pattern_dies_at_startup(self):
        d = Path(tempfile.mkdtemp())
        for f in PATTERNS.glob("fk-*.md"):
            shutil.copy(f, d / f.name)
        fk05 = d / "fk-05-readiness-assessment.md"
        fk05.write_text(fk05.read_text().replace("routes_to: FK-04", "routes_to: FK-07"))
        with pytest.raises(CatalogError, match="unknown pattern 'FK-07'"):
            load_catalog(d)
