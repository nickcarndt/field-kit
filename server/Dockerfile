# Build context is the REPO ROOT (see railway.toml), not server/ — the
# catalog reads patterns/*.md at startup, so the content ships inside the
# image. A server image without its patterns boots locally and dies on
# Railway with a CatalogError.

FROM python:3.12-slim

WORKDIR /app

COPY server/ server/
COPY patterns/ patterns/

# One copy-then-install layer instead of a cached dependency layer: this
# image rebuilds in about a minute and the content changes more often than
# the deps anyway. Optimize when that stops being true.
RUN pip install --no-cache-dir ./server

# pip install relocates mcp_server into site-packages, so config.py's
# repo-relative default for patterns_dir points at nothing in here — the
# env var is load-bearing, not decoration.
ENV FIELDKIT_PATTERNS_DIR=/app/patterns

# Railway injects PORT; map it to our namespaced setting at start time.
CMD ["sh", "-c", "FIELDKIT_PORT=${PORT:-8000} python -m mcp_server.main"]
