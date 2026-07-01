"""
Fixtures pytest partagees entre tous les tests.
"""
import uuid as uuid_pkg
import sqlite3
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, text as sa_text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID as PGUuid
from sqlalchemy.ext.compiler import compiles

from app.main import app
from app.database import Base, get_db


# ---- Fix PGUuid for SQLite ----
# PGUuid's result_processor calls .hex() which only works on uuid.UUID,
# but SQLite returns strings. We patch result_processor + bind_processor.

_orig_rp = PGUuid.result_processor
def _patched_rp(self, dialect, coltype):
    if dialect.name == 'sqlite':
        def process(value):
            if value is not None and not isinstance(value, uuid_pkg.UUID):
                return uuid_pkg.UUID(value)
            return value
        return process
    return _orig_rp(self, dialect, coltype) if _orig_rp else None
PGUuid.result_processor = _patched_rp

_orig_bp = PGUuid.bind_processor
def _patched_bp(self, dialect):
    if dialect.name == 'sqlite':
        def process(value):
            if value is not None:
                return str(value)
            return value
        return process
    return _orig_bp(self, dialect) if _orig_bp else None
PGUuid.bind_processor = _patched_bp

# Make PGUuid render as VARCHAR(36) on SQLite
@compiles(PGUuid, "sqlite")
def compile_uuid_sqlite(type_, compiler, **kw):
    return "VARCHAR(36)"

# ---- Test DB ----
TEST_DATABASE_URL = "sqlite:///./test_veltrix.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(autouse=True)
def clean_db():
    """Clean all tables before each test for full isolation."""
    with test_engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()
    yield


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "fixture@veltrix.io",
        "password": "FixturePass1",
        "full_name": "Fixture User",
        "organization_name": "Fixture Organisation",
    })
    assert response.status_code == 201, f"Fixture register failed: {response.text}"
    data = response.json()
    return {
        "email": "fixture@veltrix.io",
        "password": "FixturePass1",
        "token": data["access_token"],
    }


@pytest.fixture
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['token']}"}


@pytest.fixture
def created_agent(client, auth_headers):
    response = client.post("/api/v1/agents", json={
        "name": "test-agent-fixture",
        "description": "Agent cree par fixture pytest",
    }, headers=auth_headers)
    assert response.status_code == 201, f"Fixture create agent failed: {response.text}"
    return response.json()
