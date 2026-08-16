"""FieldKit MCP server entry point — streamable HTTP behind the fail-closed gate."""

import functools
import json
import logging
from typing import Annotated

from mcp.server.fastmcp import FastMCP
from mcp.types import ToolAnnotations
from pydantic import Field

from mcp_server.auth import ApiKeyGate
from mcp_server.catalog import load_catalog
from mcp_server.config import get_settings
from mcp_server.tools.assess_readiness import assess_readiness as run_assess_readiness
from mcp_server.tools.get_pattern import get_pattern as run_get_pattern
from mcp_server.tools.list_patterns import list_patterns as run_list_patterns
from mcp_server.tools.recommend_pattern import recommend_pattern as run_recommend_pattern

# Railway captures stdout — this plus the traced() decorator is the tracing
# FK-04's eval plan promises: every tool call logged with inputs and result.
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")
logger = logging.getLogger("fieldkit.tools")

settings = get_settings()

# Loaded at import time on purpose: a malformed pattern file kills the deploy
# with a filename in the log, instead of surfacing mid-demo in a tool call.
CATALOG = load_catalog(settings.patterns_dir)

# The axis keys come from whichever pattern declares `axes` (FK-05 today),
# so the tool description below can never drift from the data it validates.
_AXIS_KEYS = [a.key for p in CATALOG.values() for a in p.axes]

mcp = FastMCP(
    "fieldkit",
    host=settings.host,
    port=settings.port,
    stateless_http=True,
    json_response=True,
)

# All four tools are side-effect-free catalog reads; saying so in the
# protocol lets clients skip needless confirmation prompts.
READ_ONLY = ToolAnnotations(readOnlyHint=True, idempotentHint=True)


def traced(fn):
    """Tool-call tracing: name, inputs (truncated), result size or error."""

    @functools.wraps(fn)
    def wrapper(**kwargs):
        call = ", ".join(f"{k}={str(v)[:120]!r}" for k, v in kwargs.items())
        try:
            result = fn(**kwargs)
        except Exception as e:
            logger.info("tool=%s args=(%s) error=%r", fn.__name__, call, e)
            raise
        logger.info(
            "tool=%s args=(%s) result_bytes=%d",
            fn.__name__, call, len(json.dumps(result, default=str)),
        )
        return result

    return wrapper


# Descriptions are passed explicitly (not docstrings): this text is the UI a
# calling model reads, and raw docstrings ship with continuation indentation.

@mcp.tool(
    annotations=READ_ONLY,
    description="List the FieldKit catalog: every pattern's id, name, one-line "
    "thesis, and the client objection it kills. Start here to see what exists.",
)
@traced
def list_patterns() -> list[dict[str, str]]:
    return run_list_patterns(CATALOG)


@mcp.tool(
    annotations=READ_ONLY,
    description="Fetch one complete FieldKit pattern by catalog id (e.g. 'FK-01'): "
    "problem scene, when to use, architecture, eval plan, field failure modes, "
    "the objection it kills, live exemplars, and a 90-minute workshop outline.",
)
@traced
def get_pattern(pattern_id: str) -> dict[str, object]:
    return run_get_pattern(CATALOG, pattern_id)


@mcp.tool(
    annotations=READ_ONLY,
    description="Given a plain-English use case (e.g. 'a claims-processing agent "
    "for an insurance client'), recommend which FieldKit pattern(s) fit and why. "
    "Returns ranked patterns with the matched triggers as evidence — the scoring "
    "is a deterministic, auditable rubric, not a model call.",
)
@traced
def recommend_pattern(use_case: str) -> dict[str, object]:
    return run_recommend_pattern(CATALOG, use_case)


@mcp.tool(
    annotations=READ_ONLY,
    description="Score a practice's deployment readiness. `answers` requires "
    f"exactly these axis keys: {_AXIS_KEYS}, each a non-empty list of anchored "
    "integer scores 0-3 (one per questionnaire item; get_pattern('FK-05') "
    "describes the axes and the anchoring method). Returns a maturity profile "
    "and a roadmap routing each gap to a FieldKit pattern, weakest axis first.",
)
@traced
def assess_readiness(
    answers: dict[str, list[Annotated[int, Field(strict=True, ge=0, le=3)]]],
) -> dict[str, object]:
    # strict=True puts the 0-3 bounds in the published schema AND stops
    # pydantic's lax coercion of JSON true/2.0/"3" into ints at the wire.
    return run_assess_readiness(CATALOG, answers)


# We run uvicorn against the wrapped ASGI app instead of calling mcp.run():
# mcp.run() would start its own server around the unwrapped app and the auth
# gate would never see a request.
app = ApiKeyGate(mcp.streamable_http_app(), expected_key=settings.api_key)


def run() -> None:
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)


if __name__ == "__main__":
    run()
