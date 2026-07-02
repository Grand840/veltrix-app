"""Tests du systeme d'alertes"""
import pytest


class TestAlertEndpoints:

    def test_list_alerts_empty(self, client, auth_headers):
        response = client.get("/api/v1/alerts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        assert data["total"] == 0
        assert data["total_critical"] == 0
        assert data["total_firing"] == 0
        assert "page" in data
        assert "per_page" in data

    def test_list_alerts_with_agent_key_and_high_metrics(self, client, auth_headers, created_agent):
        agent_key = created_agent["api_key"]
        ingest_headers = {"X-Agent-Key": agent_key}
        payload = {
            "api_key": agent_key,
            "hostname": "test-host",
            "cpu_pct": 90.0,
            "mem_used_pct": 50.0,
            "mem_used_gb": 1.0,
            "mem_total_gb": 2.0,
            "disk_used_pct": 50.0,
            "disk_used_gb": 50.0,
            "disk_total_gb": 100.0,
        }
        resp = client.post("/api/v1/metrics/ingest", json=payload, headers=ingest_headers)
        assert resp.status_code == 200, f"Ingest failed: {resp.text}"

        resp2 = client.get("/api/v1/alerts", headers=auth_headers)
        assert resp2.status_code == 200
        data = resp2.json()
        assert data["total"] >= 1
        assert data["total_critical"] >= 1
        firing = [a for a in data["alerts"] if a["status"] == "firing"]
        assert len(firing) >= 1
        cpu_alerts = [a for a in firing if a["metric"] == "cpu_usage"]
        assert len(cpu_alerts) >= 1
        assert cpu_alerts[0]["severity"] == "critical"
        assert cpu_alerts[0]["current_value"] == 90.0

    def test_list_alerts_filter_by_severity(self, client, auth_headers, created_agent):
        agent_key = created_agent["api_key"]
        ingest_headers = {"X-Agent-Key": agent_key}
        payload = {
            "api_key": agent_key,
            "hostname": "test-host",
            "cpu_pct": 90.0,
            "mem_used_pct": 80.0,
            "mem_used_gb": 1.0,
            "mem_total_gb": 2.0,
            "disk_used_pct": 50.0,
            "disk_used_gb": 50.0,
            "disk_total_gb": 100.0,
        }
        client.post("/api/v1/metrics/ingest", json=payload, headers=ingest_headers)

        resp = client.get("/api/v1/alerts?severity=warning", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        for a in data["alerts"]:
            assert a["severity"] == "warning"

    def test_list_alerts_filter_by_status(self, client, auth_headers, created_agent):
        agent_key = created_agent["api_key"]
        ingest_headers = {"X-Agent-Key": agent_key}
        payload = {
            "api_key": agent_key,
            "hostname": "test-host",
            "cpu_pct": 90.0,
            "mem_used_pct": 50.0,
            "mem_used_gb": 1.0,
            "mem_total_gb": 2.0,
            "disk_used_pct": 50.0,
            "disk_used_gb": 50.0,
            "disk_total_gb": 100.0,
        }
        client.post("/api/v1/metrics/ingest", json=payload, headers=ingest_headers)

        resp = client.get("/api/v1/alerts?status=firing", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        for a in data["alerts"]:
            assert a["status"] == "firing"

    def test_list_alerts_pagination(self, client, auth_headers):
        resp = client.get("/api/v1/alerts?page=1&per_page=5", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["page"] == 1
        assert data["per_page"] == 5

    def test_list_alerts_invalid_status(self, client, auth_headers):
        resp = client.get("/api/v1/alerts?status=invalid", headers=auth_headers)
        assert resp.status_code == 400
        data = resp.json()
        assert data["error"] == "INVALID_ALERT_STATUS"

    def test_list_alerts_invalid_severity(self, client, auth_headers):
        resp = client.get("/api/v1/alerts?severity=invalid", headers=auth_headers)
        assert resp.status_code == 400
        data = resp.json()
        assert data["error"] == "INVALID_ALERT_SEVERITY"

    def test_acknowledge_alert(self, client, auth_headers, created_agent):
        agent_key = created_agent["api_key"]
        ingest_headers = {"X-Agent-Key": agent_key}
        payload = {
            "api_key": agent_key,
            "hostname": "test-host",
            "cpu_pct": 90.0,
            "mem_used_pct": 50.0,
            "mem_used_gb": 1.0,
            "mem_total_gb": 2.0,
            "disk_used_pct": 50.0,
            "disk_used_gb": 50.0,
            "disk_total_gb": 100.0,
        }
        client.post("/api/v1/metrics/ingest", json=payload, headers=ingest_headers)
        list_resp = client.get("/api/v1/alerts?status=firing", headers=auth_headers)
        assert list_resp.status_code == 200
        alerts = list_resp.json()["alerts"]
        assert len(alerts) > 0, "No firing alerts found"
        alert_id = alerts[0]["id"]

        ack_resp = client.post(f"/api/v1/alerts/{alert_id}/acknowledge", json={}, headers=auth_headers)
        assert ack_resp.status_code == 200
        data = ack_resp.json()
        assert data["status"] == "acknowledged"
        assert data["acknowledged_at"] is not None

    def test_acknowledge_nonexistent_alert(self, client, auth_headers):
        fake_id = "00000000-0000-0000-0000-000000000000"
        resp = client.post(f"/api/v1/alerts/{fake_id}/acknowledge", json={}, headers=auth_headers)
        assert resp.status_code == 404
        assert resp.json()["error"] == "ALERT_NOT_FOUND"

    def test_alert_response_format(self, client, auth_headers, created_agent):
        agent_key = created_agent["api_key"]
        ingest_headers = {"X-Agent-Key": agent_key}
        payload = {
            "api_key": agent_key,
            "hostname": "test-host",
            "cpu_pct": 90.0,
            "mem_used_pct": 50.0,
            "mem_used_gb": 1.0,
            "mem_total_gb": 2.0,
            "disk_used_pct": 50.0,
            "disk_used_gb": 50.0,
            "disk_total_gb": 100.0,
        }
        client.post("/api/v1/metrics/ingest", json=payload, headers=ingest_headers)
        resp = client.get("/api/v1/alerts", headers=auth_headers)
        assert resp.status_code == 200
        alerts = resp.json()["alerts"]
        assert len(alerts) > 0, "No alerts found"
        alert = alerts[0]
        required = ["id", "title", "metric", "severity", "status", "agent_id", "agent_name"]
        for field in required:
            assert field in alert, f"Missing field: {field}"
        assert alert["agent_name"] == "test-agent-fixture"

    def test_alerts_require_auth(self, client):
        assert client.get("/api/v1/alerts").status_code == 403
        assert client.post("/api/v1/alerts/fake-id/acknowledge", json={}).status_code == 403

    def test_openapi_has_alerts_routes(self, client):
        resp = client.get("/openapi.json")
        paths = resp.json()["paths"]
        assert "/api/v1/alerts" in paths
        assert "/api/v1/alerts/{alert_id}/acknowledge" in paths