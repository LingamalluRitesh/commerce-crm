from app.core.config import Settings


def test_settings_initialization():
    settings = Settings(
        PROJECT_NAME="TestCRM",
        POSTGRES_SERVER="db.example.com",
        POSTGRES_PORT=5432,
        POSTGRES_USER="testuser",
        POSTGRES_PASSWORD="testpassword",
        POSTGRES_DB="testdb",
        DATABASE_URL=None,
    )
    assert settings.PROJECT_NAME == "TestCRM"
    assert (
        settings.async_database_url
        == "postgresql+asyncpg://testuser:testpassword@db.example.com:5432/testdb"
    )
    assert settings.redis_url == "redis://localhost:6379/0"


def test_cors_origins_parsing():
    settings = Settings(BACKEND_CORS_ORIGINS=["http://localhost:3000", "https://app.example.com"])
    assert len(settings.BACKEND_CORS_ORIGINS) == 2
    assert "https://app.example.com" in settings.BACKEND_CORS_ORIGINS
