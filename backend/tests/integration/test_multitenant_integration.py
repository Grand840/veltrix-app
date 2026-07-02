"""
Tests d integration - Isolation multi-tenant complete.
"""
import pytest
import time
from tests.integration.conftest import ingest_metrics


@pytest.mark.integration
class TestAgentIsolation:

    def test_org_a_cannot_see_org_b_agents(self, http, org_a, org_b, agent_a, agent_b):
        resp_a = http.get("/api/v1/agents", headers=org_a["headers"])
        assert resp_a.status_code == 200
        agent_ids_a = [a["id"] for a in resp_a.json()["agents"]]
        assert agent_a["agent_id"] in agent_ids_a
        assert agent_b["agent_id"] not in agent_ids_a

    def test_org_a_cannot_get_org_b_agent_by_id(self, http, org_a, agent_b):
        resp = http.get(f"/api/v1/agents/{agent_b['agent_id']}",
            headers=org_a["headers"])
        assert resp.status_code == 404
        assert resp.json()["error"] == "AGENT_NOT_FOUND"

    def test_org_a_cannot_update_org_b_agent(self, http, org_a, agent_b):
        resp = http.patch(f"/api/v1/agents/{agent_b['agent_id']}",
            headers=org_a["headers"], json={"name": "hacked"})
        assert resp.status_code == 404

    def test_org_a_cannot_delete_org_b_agent(self, http, org_a, agent_b):
        resp = http.delete(f"/api/v1/agents/{agent_b['agent_id']}",
            headers=org_a["headers"])
        assert resp.status_code == 404

    def test_plan_limit_per_organization(self, http, org_a):
        created = []
        for i in range(3):
            r = http.post("/api/v1/agents",
                json={"name": f"limit-agent-{i}"},
                headers=org_a["headers"])
            if r.status_code == 201:
                created.append(r.json()["agent_id"])
        overflow = http.post("/api/v1/agents",
            json={"name": "overflow"}, headers=org_a["headers"])
        assert overflow.status_code == 400
        assert overflow.json()["error"] == "AGENT_LIMIT_REACHED"


@pytest.mark.integration
class TestMetricsIsolation:

    def test_agent_key_belongs_to_one_org(self, http, agent_a, agent_b, org_a, org_b):
        resp = ingest_metrics(http, agent_a["api_key"], cpu=55.0)
        assert resp.status_code == 200
        summary_resp = http.get(
            f"/api/v1/metrics/agents/{agent_a['agent_id']}/summary",
            headers=org_b["headers"])
        assert summary_resp.status_code == 404

    def test_metrics_overview_scoped_to_org(self, http, org_a, org_b, agent_a, agent_b):
        ingest_metrics(http, agent_a["api_key"])
        ingest_metrics(http, agent_b["api_key"])
        overview_a = http.get("/api/v1/metrics/overview", headers=org_a["headers"])
        overview_b = http.get("/api/v1/metrics/overview", headers=org_b["headers"])
        assert overview_a.status_code == 200
        assert overview_b.status_code == 200
        ids_a = [s["agent_id"] for s in overview_a.json()]
        ids_b = [s["agent_id"] for s in overview_b.json()]
        assert agent_a["agent_id"] in ids_a
        assert agent_b["agent_id"] not in ids_a
        assert agent_b["agent_id"] in ids_b
        assert agent_a["agent_id"] not in ids_b

    def test_org_stats_scoped_to_org(self, http, org_a, org_b, agent_a, agent_b):
        ingest_metrics(http, agent_a["api_key"])
        ingest_metrics(http, agent_b["api_key"])
        stats_a = http.get("/api/v1/organizations/me/stats", headers=org_a["headers"]).json()
        stats_b = http.get("/api/v1/organizations/me/stats", headers=org_b["headers"]).json()
        assert stats_a["organization_id"] != stats_b["organization_id"]
        assert stats_a["agents_total"] >= 1
        assert stats_b["agents_total"] >= 1
        assert stats_a["agents_total"] < 10
        assert stats_b["agents_total"] < 10


@pytest.mark.integration
class TestAlertsIsolation:

    def test_org_a_alerts_not_visible_to_org_b(self, http, org_a, org_b, agent_a):
        ingest_metrics(http, agent_a["api_key"], cpu=92.0)
        alerts_a = http.get("/api/v1/alerts?status=firing", headers=org_a["headers"])
        assert alerts_a.status_code == 200
        a_count = alerts_a.json()["total_firing"]
        alerts_b = http.get("/api/v1/alerts?status=firing", headers=org_b["headers"])
        assert alerts_b.status_code == 200
        b_count = alerts_b.json()["total_firing"]
        assert b_count == 0
        assert a_count >= 1

    def test_org_b_cannot_ack_org_a_alert(self, http, org_a, org_b, agent_a):
        ingest_metrics(http, agent_a["api_key"], cpu=92.0)
        alerts = http.get("/api/v1/alerts?status=firing",
            headers=org_a["headers"]).json()["alerts"]
        if not alerts:
            pytest.skip("Pas d alerte firing pour ce test")
        alert_id = alerts[0]["id"]
        resp = http.post(f"/api/v1/alerts/{alert_id}/acknowledge",
            headers=org_b["headers"], json={})
        assert resp.status_code == 404
        assert resp.json()["error"] == "ALERT_NOT_FOUND"