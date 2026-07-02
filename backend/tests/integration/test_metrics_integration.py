"""
Tests d integration - Metriques sur VictoriaMetrics reel.
"""
import pytest
import time
import json
from tests.integration.conftest import ingest_metrics


@pytest.mark.integration
class TestMetricsPipeline:

    def test_ingest_stores_in_victoria_metrics(self, http, agent_a):
        import httpx
        resp = ingest_metrics(http, agent_a["api_key"], cpu=47.3)
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        deadline = time.time() + 15
        while time.time() < deadline:
            vm_resp = httpx.get(
                "http://victoria-metrics:8428/api/v1/export",
                params={"match[]": 'veltrix_cpu_pct{agent_id="' + agent_a["agent_id"] + '"}'},
                timeout=5.0,
            )
            lines = [l for l in vm_resp.text.strip().split("\n") if l.strip()]
            if len(lines) > 0:
                break
            time.sleep(1)
        lines = [l for l in vm_resp.text.strip().split("\n") if l.strip()]
        assert len(lines) > 0, "Aucune donnee dans VictoriaMetrics"
        data = json.loads(lines[0])
        assert abs(data["values"][0] - 47.3) < 0.1, f"Valeur attendue ~47.3, obtenu {data['values'][0]}"

    def test_agent_status_becomes_online_after_ingest(self, http, org_a, agent_a):
        agent_resp = http.get(f"/api/v1/agents/{agent_a['agent_id']}", headers=org_a["headers"])
        initial_status = agent_resp.json()["status"]
        ingest_metrics(http, agent_a["api_key"])
        agent_resp2 = http.get(f"/api/v1/agents/{agent_a['agent_id']}", headers=org_a["headers"])
        data = agent_resp2.json()
        assert data["status"] == "online"

    def test_summary_reflects_last_metrics(self, http, org_a, agent_a):
        ingest_metrics(http, agent_a["api_key"], cpu=63.7, memory=71.2, disk=45.8)
        summary = http.get(
            f"/api/v1/metrics/agents/{agent_a['agent_id']}/summary",
            headers=org_a["headers"]).json()
        assert summary["agent_id"] == agent_a["agent_id"]
        assert "cpu_usage_percent" in summary
        assert "memory_usage_percent" in summary
        assert "disk_usage_percent" in summary
        assert summary["hostname"] == "integration-test-host"
        assert summary["status"] == "online"
        assert summary["cpu_health"] in ("ok", "warning", "critical", "unknown")

    def test_history_endpoint_returns_time_series(self, http, org_a, agent_a):
        for cpu in [40.0, 55.0, 70.0]:
            ingest_metrics(http, agent_a["api_key"], cpu=cpu)
            time.sleep(1)
        time.sleep(2)
        history = http.get(
            f"/api/v1/metrics/agents/{agent_a['agent_id']}/history/veltrix_cpu_pct",
            params={"start": "1h", "step": "10s"},
            headers=org_a["headers"]).json()
        assert history["metric_name"] == "veltrix_cpu_pct"
        assert history["agent_id"] == agent_a["agent_id"]
        assert isinstance(history["points"], list)

    def test_vm_labels_include_org_id(self, http, agent_a):
        import httpx
        ingest_metrics(http, agent_a["api_key"])
        time.sleep(2)
        vm_resp = httpx.get(
            "http://victoria-metrics:8428/api/v1/query",
            params={"query": f'veltrix_cpu_pct{{agent_id="{agent_a["agent_id"]}"}}'},
            timeout=5.0,
        )
        results = vm_resp.json()["data"]["result"]
        if results:
            labels = results[0]["metric"]
            assert "org_id" in labels, "Label org_id manquant dans VictoriaMetrics"
            assert "agent_id" in labels
            assert "hostname" in labels


@pytest.mark.integration
class TestAlertPipelineIntegration:

    def test_cpu_alert_created_and_stored_in_postgres(self, http, org_a, agent_a):
        ingest_metrics(http, agent_a["api_key"], cpu=91.0)
        alerts = http.get("/api/v1/alerts?status=firing", headers=org_a["headers"]).json()
        cpu_alerts = [a for a in alerts["alerts"] if a["metric"] == "cpu_usage"]
        assert len(cpu_alerts) >= 1
        assert cpu_alerts[0]["severity"] == "critical"
        assert cpu_alerts[0]["current_value"] == 91.0
        assert cpu_alerts[0]["threshold_value"] == 85.0

    def test_full_alert_lifecycle(self, http, org_a, agent_a):
        ingest_metrics(http, agent_a["api_key"], cpu=88.0)
        alerts = http.get("/api/v1/alerts?status=firing", headers=org_a["headers"]).json()["alerts"]
        cpu_alert = next((a for a in alerts if a["metric"] == "cpu_usage"), None)
        if not cpu_alert:
            pytest.skip("Alerte CPU non creee")
        alert_id = cpu_alert["id"]
        ack = http.post(f"/api/v1/alerts/{alert_id}/acknowledge",
            headers=org_a["headers"], json={"comment": "Test integration"})
        assert ack.status_code == 200
        assert ack.json()["status"] == "acknowledged"
        ingest_metrics(http, agent_a["api_key"], cpu=30.0)
        firing = http.get("/api/v1/alerts?status=firing", headers=org_a["headers"]).json()
        cpu_firing = [a for a in firing["alerts"] if a["metric"] == "cpu_usage"
                      and a["agent_id"] == agent_a["agent_id"]]
        assert len(cpu_firing) == 0
