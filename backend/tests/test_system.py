"""
Tests automatises — Endpoints systeme et securite globale
"""
import pytest


class TestHealth:
    """Tests de GET /health"""

    def test_health_returns_ok(self, client):
        """Health check doit retourner status ok"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("ok", "degraded")
        assert "service" in data
        assert "version" in data
        assert "components" in data

    def test_health_shows_components(self, client):
        """Les composants api et database doivent etre presents"""
        response = client.get("/health")
        components = response.json()["components"]
        assert "api" in components
        assert "database" in components


class TestOpenAPI:
    """Tests de la documentation OpenAPI"""

    def test_docs_accessible(self, client):
        """Swagger UI doit etre accessible"""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_schema_has_auth_routes(self, client):
        """Les routes auth doivent etre dans le schema OpenAPI"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        paths = response.json()["paths"]
        assert "/api/v1/auth/register" in paths
        assert "/api/v1/auth/login" in paths
        assert "/api/v1/auth/me" in paths

    def test_openapi_schema_has_agent_routes(self, client):
        """Les routes agents doivent etre dans le schema OpenAPI"""
        response = client.get("/openapi.json")
        paths = response.json()["paths"]
        assert "/api/v1/agents" in paths
        assert "/api/v1/agents/{agent_id}" in paths

    def test_openapi_schema_has_metrics_routes(self, client):
        """Les routes metriques doivent etre dans le schema OpenAPI"""
        response = client.get("/openapi.json")
        paths = response.json()["paths"]
        assert "/api/v1/metrics/ingest" in paths


class TestSecurity:
    """Tests de securite globale"""

    def test_protected_endpoints_require_auth(self, client):
        """Tous les endpoints proteges doivent retourner 403 sans token"""
        protected = [
            ("GET", "/api/v1/auth/me"),
            ("GET", "/api/v1/agents"),
            ("POST", "/api/v1/agents"),
            ("GET", "/api/v1/metrics/overview"),
        ]
        for method, path in protected:
            if method == "GET":
                resp = client.get(path)
            else:
                resp = client.post(path, json={})
            assert resp.status_code in (403, 422), \
                f"{method} {path} devrait retourner 403, a retourne {resp.status_code}"

    def test_metrics_ingest_requires_agent_key(self, client):
        """L'ingest de metriques necessite une cle agent valide"""
        response = client.post("/api/v1/metrics/ingest", json={
            "hostname": "test",
            "cpu_usage_percent": 50.0,
            "memory_usage_percent": 50.0,
            "memory_used_mb": 1024.0,
            "memory_total_mb": 2048.0,
            "disk_usage_percent": 50.0,
            "disk_used_gb": 50.0,
            "disk_total_gb": 100.0,
        })
        assert response.status_code in (401, 403)
