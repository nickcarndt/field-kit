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


class TestListPatterns:
    def test_five_patterns_sorted_with_summary_keys_only(self):
        rows = list_patterns(CATALOG)
        assert [r["id"] for r in rows] == sorted(r["id"] for r in rows)
        assert len(rows) == 5
        assert all(set(r) == {"id", "name", "thesis", "kills", "taxonomy"} for r in rows)
