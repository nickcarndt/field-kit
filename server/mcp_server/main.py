"""FieldKit MCP server entry point — streamable HTTP behind the fail-closed gate."""

from mcp.server.fastmcp import FastMCP

from mcp_server.auth import ApiKeyGate
from mcp_server.catalog import load_catalog
from mcp_server.config import get_settings
from mcp_server.tools.get_pattern import get_pattern as run_get_pattern
from mcp_server.tools.list_patterns import list_patterns as run_list_patterns
from mcp_server.tools.recommend_pattern import recommend_pattern as run_recommend_pattern

settings = get_settings()

# Loaded at import time on purpose: a malformed pattern file kills the deploy
# with a filename in the log, instead of surfacing mid-demo in a tool call.
CATALOG = load_catalog(settings.patterns_dir)

mcp = FastMCP(
    "fieldkit",
    host=settings.host,
    port=settings.port,
    stateless_http=True,
    json_response=True,
)


@mcp.tool()
def list_patterns() -> list[dict[str, str]]:
    """List the FieldKit catalog: every pattern's id, name, one-line thesis,
    and the client objection it kills. Start here to see what exists."""
    return run_list_patterns(CATALOG)


@mcp.tool()
def get_pattern(pattern_id: str) -> dict[str, object]:
    """Fetch one complete FieldKit pattern by catalog id (e.g. 'FK-01'):
    problem scene, when to use, architecture, eval plan, field failure modes,
    the objection it kills, live exemplars, and a 90-minute workshop outline."""
    return run_get_pattern(CATALOG, pattern_id)


@mcp.tool()
def recommend_pattern(use_case: str) -> dict[str, object]:
    """Given a plain-English use case (e.g. 'a claims-processing agent for an
    insurance client'), recommend which FieldKit pattern(s) fit and why.
    Returns ranked patterns with the matched triggers as evidence — the
    scoring is a deterministic, auditable rubric, not a model call."""
    return run_recommend_pattern(CATALOG, use_case)


# We run uvicorn against the wrapped ASGI app instead of calling mcp.run():
# mcp.run() would start its own server around the unwrapped app and the auth
# gate would never see a request.
app = ApiKeyGate(mcp.streamable_http_app(), expected_key=settings.api_key)


def run() -> None:
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)


if __name__ == "__main__":
    run()
