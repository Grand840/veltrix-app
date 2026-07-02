"""
Fixtures pour les tests d integration.
Ces tests tournent contre les VRAIS services Docker.
"""
import pytest
import httpx
import os
import time

API_BASE = os.getenv("VELTRIX_TEST_URL", "http://localhost:8000")
API_PREFIX = f"{API_BASE}/api/v1"


def wait_for_api(max_retries: int = 10, delay: float = 1.0):
    for i in range(max_retries):
        try:
            resp = httpx.get(f"{API_BASE}/health", timeout=2.0)
            if resp.status_code == 200:
                return True
        except httpx.RequestError:
            pass
        time.sleep(delay)
    raise RuntimeError(f"API non disponible apres {max_retries} tentatives sur {API_BASE}")


@pytest.fixture(scope="session", autouse=True)
def ensure_api_running():
    wait_for_api()


@pytest.fixture(scope="session")
def http():
    with httpx.Client(base_url=API_BASE, timeout=10.0) as client:
        yield client


@pytest.fixture
def org_a(http):
    ts = int(time.time() * 1000)
    resp = http.post(f"{API_PREFIX}/auth/register", json={
        "email": f"org_a_{ts}@veltrix-test.io",
        "password": "IntegrationA1",
        "full_name": "Org A Owner",
        "organization_name": f"Organisation A {ts}",
    })
    assert resp.status_code == 201, f"Register org_a failed: {resp.text}"
    token = resp.json()["access_token"]
    return {
        "email": f"org_a_{ts}@veltrix-test.io",
        "password": "IntegrationA1",
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def org_b(http):
    ts = int(time.time() * 1000) + 1
    resp = http.post(f"{API_PREFIX}/auth/register", json={
        "email": f"org_b_{ts}@veltrix-test.io",
        "password": "IntegrationB1",
        "full_name": "Org B Owner",
        "organization_name": f"Organisation B {ts}",
    })
    assert resp.status_code == 201, f"Register org_b failed: {resp.text}"
    token = resp.json()["access_token"]
    return {
        "email": f"org_b_{ts}@veltrix-test.io",
        "password": "IntegrationB1",
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def agent_a(http, org_a):
    resp = http.post(f"{API_PREFIX}/agents",
        json={"name": "integration-agent-a", "description": "Agent test org A"},
        headers=org_a["headers"])
    assert resp.status_code == 201
    data = resp.json()
    return {
        "agent_id": data["agent_id"],
        "api_key": data["api_key"],
        "headers": {"X-Agent-Key": data["api_key"]},
    }


@pytest.fixture
def agent_b(http, org_b):
    resp = http.post(f"{API_PREFIX}/agents",
        json={"name": "integration-agent-b"},
        headers=org_b["headers"])
    assert resp.status_code == 201
    data = resp.json()
    return {
        "agent_id": data["agent_id"],
        "api_key": data["api_key"],
        "headers": {"X-Agent-Key": data["api_key"]},
    }


def ingest_metrics(http, agent_key: str, cpu: float = 45.0, memory: float = 60.0, disk: float = 50.0):
    return http.post(f"{API_PREFIX}/metrics/ingest",
        headers={"X-Agent-Key": agent_key, "Content-Type": "application/json"},
        json={
            "api_key": agent_key,
            "hostname": "integration-test-host",
            "cpu_pct": cpu,
            "mem_used_pct": memory,
            "disk_used_pct": disk,
            "mem_total_gb": 4.0,
            "mem_used_gb": memory * 0.04,
            "disk_total_gb": 200.0,
            "disk_used_gb": disk * 2.0,
            "network_bytes_sent": 1000.0,
            "network_bytes_recv": 2000.0,
        })