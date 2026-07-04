import httpx
client = httpx.Client(base_url="http://localhost:8000", timeout=10.0)
r = client.post("/api/v1/auth/register", json={
    "email": "httpx_debug@test.io",
    "password": "IntegrationA1",
    "full_name": "Httpx Debug",
    "organization_name": "Httpx Org",
})
print("Status:", r.status_code)
print("Headers:", dict(r.headers))
print("Body:", r.text)
