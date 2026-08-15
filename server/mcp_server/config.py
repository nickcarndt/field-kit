"""Environment-backed configuration for the FieldKit MCP server."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
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
    host: str = "0.0.0.0"
    port: int = 8000
    patterns_dir: Path = _REPO_ROOT / "patterns"


@lru_cache
def get_settings() -> Settings:
    return Settings()
