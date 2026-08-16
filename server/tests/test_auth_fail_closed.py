"""Pins the fail-closed promise FK-04 makes in print.

The unset-key cases are the ones that matter: almost any implementation
rejects a caller with no key, but only a deliberately fail-closed one
rejects every caller when the SERVER has no key configured.
"""

from starlette.testclient import TestClient

from mcp_server.auth import ApiKeyGate, is_authorized


async def _ok_app(scope, receive, send):
    await send({"type": "http.response.start", "status": 200, "headers": []})
    await send({"type": "http.response.body", "body": b"ok"})


def client(expected_key: str | None) -> TestClient:
    return TestClient(ApiKeyGate(_ok_app, expected_key=expected_key))


class TestMisconfiguredServerLocks:
    def test_unset_key_rejects_a_valid_looking_caller(self):
        assert client(None).get("/", headers={"x-api-key": "anything"}).status_code == 401

    def test_unset_key_rejects_a_caller_with_no_key(self):
        assert client(None).get("/").status_code == 401

    def test_empty_string_key_rejects_empty_string_caller(self):
        # The nastiest lazy-code pass: "" == "" must not authorize.
        assert client("").get("/", headers={"x-api-key": ""}).status_code == 401


class TestConfiguredServer:
    def test_missing_key_rejected(self):
        assert client("sk-fieldkit").get("/").status_code == 401

    def test_wrong_key_rejected(self):
        assert client("sk-fieldkit").get("/", headers={"x-api-key": "sk-wrong"}).status_code == 401

    def test_correct_key_via_x_api_key_passes(self):
        assert client("sk-fieldkit").get("/", headers={"x-api-key": "sk-fieldkit"}).status_code == 200

    def test_correct_key_via_bearer_passes(self):
        r = client("sk-fieldkit").get("/", headers={"Authorization": "Bearer sk-fieldkit"})
        assert r.status_code == 200

    def test_non_bearer_scheme_rejected(self):
        r = client("sk-fieldkit").get("/", headers={"Authorization": "Basic sk-fieldkit"})
        assert r.status_code == 401

    def test_rejection_body_is_generic(self):
        # No failure mode may explain itself to the caller.
        assert client("sk-fieldkit").get("/").json() == {"error": "unauthorized"}


class TestHardening:
    def test_duplicate_api_key_headers_rejected(self):
        # Even two copies of the CORRECT key: duplicate auth headers are a
        # smuggling vector behind proxies, so the gate refuses to pick one.
        r = client("sk-fieldkit").get(
            "/", headers=[("x-api-key", "sk-fieldkit"), ("x-api-key", "sk-fieldkit")]
        )
        assert r.status_code == 401

    def test_whitespace_configured_key_is_treated_as_unset(self):
        from mcp_server.config import Settings

        assert Settings(api_key="   ").api_key is None
        assert Settings(api_key=" real-key ").api_key == "real-key"


class TestPureLogic:
    def test_truth_table(self):
        assert is_authorized("k", "k") is True
        for presented, expected in [(None, None), ("k", None), (None, "k"),
                                    ("wrong", "k"), ("", ""), ("k", "")]:
            assert is_authorized(presented, expected) is False
