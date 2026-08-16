"""Fail-closed API key gate for the HTTP surface.

The load-bearing decision is the first branch of is_authorized: a server
with no key configured refuses every request. Misconfiguration must produce
an outage, never an exposure — the lazy `if expected_key and ...` shape does
the opposite and nobody notices until the audit.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging

logger = logging.getLogger("fieldkit.auth")


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


def caller_id(presented: str | None) -> str:
    """A loggable caller identity that never exposes the credential."""
    if not presented:
        return "anonymous"
    return hashlib.sha256(presented.encode()).hexdigest()[:12]


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
        # Deny by default: known scope types are handled explicitly, so a
        # future websocket (or anything else) route can never silently
        # inherit an auth bypass by riding a catch-all passthrough.
        if scope["type"] == "lifespan":
            await self.app(scope, receive, send)
            return
        if scope["type"] == "websocket":
            await receive()  # websocket.connect
            await send({"type": "websocket.close", "code": 1008})
            return
        if scope["type"] != "http":
            return

        raw_headers = scope.get("headers", [])
        names = [k.decode("latin-1").lower() for k, _ in raw_headers]
        # Duplicate auth headers are a smuggling vector behind proxies that
        # inject their own copy; refuse rather than pick a winner.
        if names.count("x-api-key") > 1 or names.count("authorization") > 1:
            logger.warning("auth rejected: duplicate auth headers")
            await self._reject(send)
            return

        headers = {
            k.decode("latin-1").lower(): v.decode("latin-1") for k, v in raw_headers
        }
        presented = _presented_key(headers)
        if is_authorized(presented, self.expected_key):
            await self.app(scope, receive, send)
            return

        logger.warning("auth rejected: caller=%s", caller_id(presented))
        await self._reject(send)

    @staticmethod
    async def _reject(send) -> None:
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
