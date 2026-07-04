from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
r = client.post("/api/v1/auth/register", json={
    "email": "debug@test.io",
    "password": "IntegrationA1",
    "organization_name": "Debug Org",
})
print("Status:", r.status_code)
print("Body:", r.text)
