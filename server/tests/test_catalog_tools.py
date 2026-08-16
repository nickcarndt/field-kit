"""Contract tests for the two read tools — FK-04's eval plan applied to us."""

import json
from pathlib import Path

import pytest

from mcp_server.catalog import load_catalog
from mcp_server.tools.get_pattern import get_pattern
from mcp_server.tools.list_patterns import list_patterns

CATALOG = load_catalog(Path(__file__).resolve().parents[2] / "patterns")


class TestGetPattern:
    def test_normalizes_case_and_whitespace(self):
        assert get_pattern(CATALOG, "  fk-01 ")["id"] == "FK-01"

    def test_unknown_id_error_names_valid_ids(self):
        with pytest.raises(ValueError, match="valid ids: FK-01"):
            get_pattern(CATALOG, "FK-99")

    def test_result_is_json_serializable(self):
        # Pins the quoted-date contract end to end: a bare YAML date
        # anywhere in frontmatter would blow up right here.
        json.dumps(get_pattern(CATALOG, "FK-02"))


class TestAssessmentInstrument:
    def test_fk05_serves_the_full_questionnaire(self):
        # The instrument the web app renders and assess_readiness scores
        # against must be complete at the source: 4 axes x 3 items + 4
        # shared anchor labels, all from frontmatter.
        p = get_pattern(CATALOG, "FK-05")
        assert len(p["scale"]) == 4
        assert [a["key"] for a in p["axes"]] == [
            "delivery", "evals", "governance", "claude_fluency"
        ]
        assert all(len(a["items"]) == 3 for a in p["axes"])


class TestListPatterns:
    def test_five_patterns_sorted_with_summary_keys_only(self):
        rows = list_patterns(CATALOG)
        assert [r["id"] for r in rows] == sorted(r["id"] for r in rows)
        assert len(rows) == 5
        assert all(set(r) == {"id", "name", "thesis", "kills", "taxonomy"} for r in rows)
