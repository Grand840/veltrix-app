"""
Tests d integration - Authentification sur PostgreSQL reel.
"""
import pytest
import time
import re


@pytest.mark.integration
class TestAuthIntegration:

    def test_register_and_login_full_cycle(self, http):
        ts = int(time.time() * 1000)
        email = f"cycle_{ts}@veltrix-test.io"
        reg = http.post("/api/v1/auth/register", json={
            "email": email,
            "password": "CyclePass1",
            "organization_name": f"Cycle Org {ts}",
        })
        assert reg.status_code == 201
        token1 = reg.json()["access_token"]

        login = http.post("/api/v1/auth/login", json={
            "email": email,
            "password": "CyclePass1",
        })
        assert login.status_code == 200
        token2 = login.json()["access_token"]

        for token in [token1, token2]:
            me = http.get("/api/v1/auth/me",
                headers={"Authorization": f"Bearer {token}"})
            assert me.status_code == 200
            assert me.json()["email"] == email

    def test_uuid_primary_keys_in_real_postgres(self, http, org_a):
        me = http.get("/api/v1/auth/me", headers=org_a["headers"])
        assert me.status_code == 200
        data = me.json()
        uuid_pattern = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        assert re.match(uuid_pattern, data["id"]), f"ID invalide: {data['id']}"
        assert re.match(uuid_pattern, data["organization_id"])

    def test_organization_slug_unique_constraint(self, http):
        ts = int(time.time() * 1000)
        org_name = f"Same Name Org {ts}"
        r1 = http.post("/api/v1/auth/register", json={
            "email": f"slug1_{ts}@veltrix-test.io",
            "password": "SlugPass1",
            "organization_name": org_name,
        })
        r2 = http.post("/api/v1/auth/register", json={
            "email": f"slug2_{ts}@veltrix-test.io",
            "password": "SlugPass1",
            "organization_name": org_name,
        })
        assert r1.status_code == 201
        assert r2.status_code == 201
        me1 = http.get("/api/v1/auth/me",
            headers={"Authorization": f"Bearer {r1.json()['access_token']}"})
        me2 = http.get("/api/v1/auth/me",
            headers={"Authorization": f"Bearer {r2.json()['access_token']}"})
        assert me1.json()["organization_id"] != me2.json()["organization_id"]

    def test_enum_values_stored_lowercase(self, http, org_a):
        me = http.get("/api/v1/auth/me", headers=org_a["headers"])
        assert me.json()["role"] == "owner"

    def test_concurrent_registrations(self, http):
        import concurrent.futures
        ts = int(time.time() * 1000)

        def register(i):
            return http.post("/api/v1/auth/register", json={
                "email": f"concurrent_{ts}_{i}@veltrix-test.io",
                "password": "ConcurrentPass1",
                "organization_name": f"Concurrent Org {ts} {i}",
            })

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(register, i) for i in range(5)]
            results = [f.result() for f in futures]
        for r in results:
            assert r.status_code == 201, f"Concurrent registration failed: {r.text}"