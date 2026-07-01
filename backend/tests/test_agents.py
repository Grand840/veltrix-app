"""
Tests automatises — Gestion des agents (CRUD, limites, securite)
"""
import re
import pytest


class TestCreateAgent:
    """Tests de POST /api/v1/agents"""

    def test_create_agent_success(self, client, auth_headers):
        """Creation d'un agent → 201 + cle API"""
        response = client.post("/api/v1/agents", json={
            "name": "test-server-01",
            "description": "Serveur de test",
        }, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert "agent_id" in data
        assert "api_key" in data
        assert data["api_key"].startswith("vltx_")
        assert len(data["api_key"]) == 45
        assert "install_command" in data

    def test_api_key_format(self, client, auth_headers):
        """La cle API doit respecter le format vltx_<40 chars>"""
        response = client.post("/api/v1/agents", json={
            "name": "key-format-test",
        }, headers=auth_headers)
        assert response.status_code == 201
        api_key = response.json()["api_key"]
        assert re.match(r"^vltx_[a-zA-Z0-9]{40}$", api_key)

    def test_create_agent_requires_auth(self, client):
        """Sans authentification → 403"""
        response = client.post("/api/v1/agents", json={"name": "unauthorized"})
        assert response.status_code == 403

    def test_create_agent_name_too_short(self, client, auth_headers):
        """Nom trop court → 422"""
        response = client.post("/api/v1/agents", json={
            "name": "x",
        }, headers=auth_headers)
        assert response.status_code == 422

    def test_plan_limit_free_tier(self, client, auth_headers):
        """Plan free = 3 agents max. Le 4e doit retourner 400."""
        list_resp = client.get("/api/v1/agents", headers=auth_headers)
        current_count = list_resp.json()["total"]

        created = []
        for i in range(3 - current_count):
            resp = client.post("/api/v1/agents", json={
                "name": f"limit-test-{i}",
            }, headers=auth_headers)
            if resp.status_code == 201:
                created.append(resp.json()["agent_id"])

        response = client.post("/api/v1/agents", json={
            "name": "over-limit",
        }, headers=auth_headers)
        assert response.status_code == 400
        assert "limite" in response.json()["detail"].lower()


class TestListAgents:
    """Tests de GET /api/v1/agents"""

    def test_list_agents_authenticated(self, client, auth_headers, created_agent):
        """Liste des agents → 200 + liste"""
        response = client.get("/api/v1/agents", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "agents" in data
        assert "total" in data
        assert data["total"] >= 1

    def test_api_key_never_in_list(self, client, auth_headers, created_agent):
        """La cle API ne doit jamais apparaitre dans la liste"""
        response = client.get("/api/v1/agents", headers=auth_headers)
        for agent in response.json()["agents"]:
            assert agent["api_key"] is None

    def test_list_requires_auth(self, client):
        """Sans auth → 403"""
        response = client.get("/api/v1/agents")
        assert response.status_code == 403


class TestGetAgent:
    """Tests de GET /api/v1/agents/{id}"""

    def test_get_agent_success(self, client, auth_headers, created_agent):
        """Detail d'un agent existant → 200"""
        agent_id = created_agent["agent_id"]
        response = client.get(f"/api/v1/agents/{agent_id}",
            headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == agent_id
        assert data["api_key"] is None
        assert data["status"] == "pending"

    def test_get_agent_not_found(self, client, auth_headers):
        """Agent inexistant → 404"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/agents/{fake_id}",
            headers=auth_headers)
        assert response.status_code == 404

    def test_get_agent_wrong_org(self, client, created_agent):
        """Un agent d'une org ne doit pas etre accessible par une autre org"""
        other_resp = client.post("/api/v1/auth/register", json={
            "email": "other@veltrix.io",
            "password": "OtherPass1",
            "organization_name": "Other Organisation",
        })
        other_token = other_resp.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}

        agent_id = created_agent["agent_id"]
        response = client.get(f"/api/v1/agents/{agent_id}",
            headers=other_headers)
        assert response.status_code == 404


class TestUpdateAgent:
    """Tests de PATCH /api/v1/agents/{id}"""

    def test_update_agent_name(self, client, auth_headers, created_agent):
        """Modification du nom → 200 + nouveau nom"""
        agent_id = created_agent["agent_id"]
        response = client.patch(f"/api/v1/agents/{agent_id}",
            json={"name": "renamed-agent"},
            headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["name"] == "renamed-agent"

    def test_update_partial(self, client, auth_headers, created_agent):
        """Modification partielle — seuls les champs fournis changent"""
        agent_id = created_agent["agent_id"]
        original = client.get(f"/api/v1/agents/{agent_id}",
            headers=auth_headers).json()

        client.patch(f"/api/v1/agents/{agent_id}",
            json={"description": "Nouvelle description"},
            headers=auth_headers)

        updated = client.get(f"/api/v1/agents/{agent_id}",
            headers=auth_headers).json()

        assert updated["name"] == original["name"]
        assert updated["description"] == "Nouvelle description"


class TestDeleteAgent:
    """Tests de DELETE /api/v1/agents/{id}"""

    def test_delete_agent(self, client, auth_headers):
        """Suppression d'un agent → 204"""
        create_resp = client.post("/api/v1/agents",
            json={"name": "to-delete"},
            headers=auth_headers)

        if create_resp.status_code != 201:
            pytest.skip("Limite d'agents atteinte pour ce test")

        agent_id = create_resp.json()["agent_id"]

        del_resp = client.delete(f"/api/v1/agents/{agent_id}",
            headers=auth_headers)
        assert del_resp.status_code == 204

        get_resp = client.get(f"/api/v1/agents/{agent_id}",
            headers=auth_headers)
        assert get_resp.status_code == 404
