"""The shop window: enough to choose a pattern, small enough to skim."""

from mcp_server.catalog import Pattern


def list_patterns(catalog: dict[str, Pattern]) -> list[dict[str, str]]:
    return [
        {
            "id": p.id,
            "name": p.name,
            "thesis": p.thesis,
            "kills": p.kills,
            "taxonomy": p.taxonomy,
        }
        for p in sorted(catalog.values(), key=lambda p: p.id)
    ]
