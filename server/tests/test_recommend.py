"""The Block 2 hard gate, pinned as executable truth.

The spec's demo promise: 'which pattern fits a claims-processing agent for
an insurance client' returns FK-01 plus FK-03 with reasoning. If these tests
pass, the demo cannot not work.
"""

from pathlib import Path

from mcp_server.catalog import load_catalog
from mcp_server.tools.recommend_pattern import recommend_pattern

CATALOG = load_catalog(Path(__file__).resolve().parents[2] / "patterns")


def ids(result):
    return [r["id"] for r in result["recommendations"]]


class TestHardGate:
    def test_demo_query_returns_fk01_then_fk03(self):
        r = recommend_pattern(
            CATALOG, "which pattern fits a claims-processing agent for an insurance client"
        )
        assert ids(r)[0] == "FK-01"
        assert "FK-03" in ids(r)
        assert set(r["recommendations"][0]["matched_triggers"]) == {"claim", "insurance"}

    def test_every_recommendation_carries_evidence_or_reason(self):
        r = recommend_pattern(CATALOG, "reconcile vendor invoices against contracts")
        assert all(rec["matched_triggers"] or rec["reason"] for rec in r["recommendations"])

    def test_deterministic_across_runs(self):
        q = "an agent for claims and payment approvals in insurance"
        assert recommend_pattern(CATALOG, q) == recommend_pattern(CATALOG, q)

    def test_case_insensitive(self):
        r = recommend_pattern(CATALOG, "CLAIMS PROCESSING FOR AN INSURANCE CLIENT")
        assert ids(r)[0] == "FK-01"


class TestRouting:
    def test_filings_query_routes_to_fk02(self):
        r = recommend_pattern(CATALOG, "answer questions over thousands of pages of SEC filings")
        assert ids(r)[0] == "FK-02"

    def test_security_integration_query_ranks_fk04_first(self):
        r = recommend_pattern(
            CATALOG, "our security team won't approve API access to internal databases"
        )
        assert ids(r)[0] == "FK-04"  # three hits outrank FK-01's one

    def test_readiness_query_routes_to_fk05(self):
        r = recommend_pattern(CATALOG, "we have three pilots and don't know where to start")
        assert "FK-05" in ids(r)


class TestFalsePositivesStayDead:
    # Each of these was a live defect found in review; the word-boundary
    # contract killed them and these tests keep them dead.
    def test_capital_does_not_summon_fk04(self):
        r = recommend_pattern(CATALOG, "summarize the latest research on capital markets")
        assert "FK-04" not in ids(r)

    def test_authoring_does_not_summon_fk04(self):
        r = recommend_pattern(CATALOG, "help us build an authoring workflow")
        assert "FK-04" not in ids(r)

    def test_latest_does_not_summon_fk03_on_its_own(self):
        r = recommend_pattern(CATALOG, "the latest rapid prototyping ideas")
        assert all(rec["id"] == "FK-05" for rec in r["recommendations"])


class TestCompanionTriggersAreLive:
    def test_evals_only_query_returns_fk03_with_evidence_not_fallback(self):
        # Review catch: companions were skipped before matching, so an evals
        # question — the likeliest ask from this audience — falsely hit the
        # "no strong trigger match" fallback. Pinned dead.
        r = recommend_pattern(
            CATALOG, "we need an eval harness with regression metrics and a launch gate"
        )
        assert ids(r) == ["FK-03"]
        assert "eval" in r["recommendations"][0]["matched_triggers"]
        assert "no strong trigger match" not in r["recommendations"][0]["reason"]

    def test_companion_shows_its_own_evidence_when_it_also_matched(self):
        r = recommend_pattern(CATALOG, "claims processing with a proper eval gate")
        fk03 = next(rec for rec in r["recommendations"] if rec["id"] == "FK-03")
        assert "eval" in fk03["matched_triggers"]


class TestFallback:
    def test_zero_match_returns_fk05_alone(self):
        r = recommend_pattern(CATALOG, "help us plan a company offsite")
        assert ids(r) == ["FK-05"]
        assert "no strong trigger match" in r["recommendations"][0]["reason"]

    def test_fallback_does_not_get_fk03_companion(self):
        # Companions gate engagements; an unclassified ask has none yet.
        r = recommend_pattern(CATALOG, "help us plan a company offsite")
        assert "FK-03" not in ids(r)
