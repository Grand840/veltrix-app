import httpx
ts = 1000002
email = f"dbg_{ts}@integration.test"
client = httpx.Client(base_url="http://localhost:8000", timeout=10.0)
r = client.post("/api/v1/auth/register", json={
    "email": email,
    "password": "CyclePass1",
    "organization_name": f"Cycle Org {ts}",
})
print("Status:", r.status_code)
print("Response:", r.text)
