import httpx
client = httpx.Client(base_url="http://localhost:8000", timeout=10.0)

# Test 1: without full_name
r = client.post("/api/v1/auth/register", json={
    "email": "no_fullname@test.io",
    "password": "IntegrationA1",
    "organization_name": "No Fullname Org",
})
print("Test 1 - no full_name:", r.status_code, r.text[:100] if r.status_code != 201 else "OK")
print("  Headers:", dict(r.headers))

# Test 2: with full_name
r2 = client.post("/api/v1/auth/register", json={
    "email": "with_fullname@test.io",
    "password": "IntegrationA1",
    "full_name": "Test User",
    "organization_name": "With Fullname Org",
})
print("Test 2 - with full_name:", r2.status_code, r2.text[:100] if r2.status_code != 201 else "OK")
print("  Headers:", dict(r2.headers))
