"""Fail-closed API key gate for the HTTP surface.

The load-bearing decision is the first branch of is_authorized: a server
with no key configured refuses every request. Misconfiguration must produce
an outage, never an exposure — the lazy `if expected_key and ...` shape does
the opposite and nobody notices until the audit.
"""

from __future__ import annotations

import hmac
import json


def is_authorized(presented: str | None, expected: str | None) -> bool:
    if not expected:
        # Fail closed: an unset or empty server key locks the door — it does
        # not remove it. This also kills the "" == "" pass.
        return False
    if not presented:
        return False
    # compare_digest, not ==: equality short-circuits on the first wrong
    # byte, and response-time differences leak how much of a guess matched.
    return hmac.compare_digest(presented.encode(), expected.encode())


def _presented_key(headers: dict[str, str]) -> str | None:
    if key := headers.get("x-api-key"):
        return key
    scheme, _, token = headers.get("authorization", "").partition(" ")
    if scheme.lower() == "bearer" and token.strip():
        return token.strip()
    return None


class ApiKeyGate:
    """ASGI middleware, so the check runs before any MCP handler exists to
    reach. Every failure mode gets the same generic 401 — the response never
    reveals whether a key is wrong, missing, or the server is misconfigured.
    """

    def __init__(self, app, expected_key: str | None) -> None:
        self.app = app
        self.expected_key = expected_key

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = {
            k.decode("latin-1").lower(): v.decode("latin-1")
            for k, v in scope.get("headers", [])
        }
        if is_authorized(_presented_key(headers), self.expected_key):
            await self.app(scope, receive, send)
            return

        body = json.dumps({"error": "unauthorized"}).encode()
        await send({
            "type": "http.response.start",
            "status": 401,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(body)).encode()),
            ],
        })
        await send({"type": "http.response.body", "body": body})
