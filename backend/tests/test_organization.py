import pytest


class TestOrganizationEndpoints:

    def test_get_my_organization(self, client, auth_headers):
        response = client.get("/api/v1/organizations/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "plan" in data
        assert data["plan"] == "free"
        assert data["max_agents"] == 3

    def test_get_org_stats(self, client, auth_headers):
        response = client.get("/api/v1/organizations/me/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        required = [
            "organization_id", "organization_name", "plan", "max_agents",
            "agents_total", "agents_online", "agents_offline", "agents_pending",
            "alerts_firing", "alerts_critical", "plan_usage_percent",
        ]
        for field in required:
            assert field in data, f"Missing field: {field}"

    def test_org_stats_agent_count(self, client, auth_headers, created_agent):
        response = client.get("/api/v1/organizations/me/stats", headers=auth_headers)
        data = response.json()
        assert data["agents_total"] >= 1
        assert data["agents_pending"] >= 1

    def test_org_stats_plan_usage(self, client, auth_headers):
        response = client.get("/api/v1/organizations/me/stats", headers=auth_headers)
        data = response.json()
        expected = data["agents_total"] / data["max_agents"] * 100
        assert abs(data["plan_usage_percent"] - round(expected, 1)) < 0.1

    def test_org_requires_auth(self, client):
        assert client.get("/api/v1/organizations/me").status_code == 403
        assert client.get("/api/v1/organizations/me/stats").status_code == 403


class TestAgentFilters:

    def test_filter_by_valid_status(self, client, auth_headers, created_agent):
        for status in ["online", "offline", "pending", "disabled"]:
            response = client.get(f"/api/v1/agents?status={status}", headers=auth_headers)
            assert response.status_code == 200, f"Status {status} returned {response.status_code}"

    def test_filter_pending_contains_new_agent(self, client, auth_headers, created_agent):
        response = client.get("/api/v1/agents?status=pending", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        ids = [a["id"] for a in data["agents"]]
        assert created_agent["agent_id"] in ids

    def test_filter_online_excludes_pending(self, client, auth_headers, created_agent):
        response = client.get("/api/v1/agents?status=online", headers=auth_headers)
        assert response.status_code == 200
        ids = [a["id"] for a in response.json()["agents"]]
        assert created_agent["agent_id"] not in ids

    def test_filter_invalid_status(self, client, auth_headers):
        response = client.get("/api/v1/agents?status=invalid", headers=auth_headers)
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert data["error"] == "INVALID_STATUS_FILTER"
        assert "message" in data
        assert "status_code" in data


class TestStandardizedErrors:

    def test_not_found_error_format(self, client, auth_headers):
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/agents/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert "message" in data
        assert "status_code" in data
        assert data["status_code"] == 404
        assert data["error"] == "AGENT_NOT_FOUND"

    def test_error_response_has_all_fields(self, client, auth_headers):
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/agents/{fake_id}", headers=auth_headers)
        data = response.json()
        for field in ["error", "message", "status_code"]:
            assert field in data, f"Missing field: {field}"
