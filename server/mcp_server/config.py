"""Environment-backed configuration for the FieldKit MCP server."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Deployment knowledge lives in the environment, never in code."""

    model_config = SettingsConfigDict(
        env_prefix="FIELDKIT_",
        env_file=_REPO_ROOT / "server" / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Default is None, not "" — auth.is_authorized treats an unset key as
    # "reject everything," so a deploy that forgets FIELDKIT_API_KEY ships an
    # outage, not an exposure.
    api_key: str | None = Field(default=None)
    # A second, deliberately publishable key. Safe to print on the website
    # because every tool is a read-only view over content that is already
    # public in the repo — least privilege is a judgment about what is
    # behind the door. Fail-closed is unchanged: no keys configured, no
    # requests served. Production tenants get per-client private keys.
    demo_key: str | None = Field(default=None)
    host: str = "0.0.0.0"

    @field_validator("api_key", "demo_key")
    @classmethod
    def _whitespace_is_unset(cls, v: str | None) -> str | None:
        # A whitespace-only key would lock out every caller while *looking*
        # configured — normalize to unset so the outage reads as what it is.
        if v is not None and not v.strip():
            return None
        return v.strip() if v else v
    port: int = 8000
    patterns_dir: Path = _REPO_ROOT / "patterns"


@lru_cache
def get_settings() -> Settings:
    return Settings()
