"""One full pattern by catalog id — eval plan and workshop included."""

from mcp_server.catalog import Pattern


def get_pattern(catalog: dict[str, Pattern], pattern_id: str) -> dict[str, object]:
    # Normalizing case/whitespace is FK-04's own ACI advice applied to
    # ourselves: "fk-01" from a model should not be a user-visible error.
    pid = pattern_id.strip().upper()
    pattern = catalog.get(pid)
    if pattern is None:
        # The error is part of the interface: name the valid ids so the
        # calling model can self-correct instead of retrying blind.
        raise ValueError(
            f"unknown pattern id {pattern_id!r}; valid ids: {', '.join(sorted(catalog))}"
        )
    return pattern.model_dump()
