import { Page, expect } from "@playwright/test";

const API = "http://localhost:8000/api/v1";

export async function createTestAccount(page: Page): Promise<{
  email: string;
  password: string;
  token: string;
}> {
  const ts = Date.now();
  const email = `e2e_${ts}@test.veltrix.io`;
  const password = "E2eTest123";

  const resp = await page.request.post(`${API}/auth/register`, {
    data: { email, password, full_name: "E2E Test User", organization_name: `E2E Org ${ts}` },
  });

  expect(resp.status()).toBe(201);
  const data = await resp.json();
  return { email, password, token: data.access_token };
}

export async function loginViaUI(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL("**/dashboard", { timeout: 10_000 });
  } catch {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  }
}

export async function loginViaToken(page: Page, token: string): Promise<void> {
  const meResp = await page.request.get(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userData = meResp.ok ? await meResp.json() : null;

  await page.context().addCookies([
    { name: "veltrix_token", value: token, domain: "localhost", path: "/" },
  ]);
  await page.goto("/");
  await page.evaluate(({ tok, user }) => {
    localStorage.setItem("veltrix_token", tok);
    const authState = {
      state: { token: tok, user, isAuthenticated: true },
      version: 0,
    };
    localStorage.setItem("veltrix-auth", JSON.stringify(authState));
  }, { tok: token, user: userData });
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
}

export async function createTestAgent(
  page: Page,
  token: string,
  name = "e2e-test-agent"
): Promise<{ agent_id: string; api_key: string }> {
  const resp = await page.request.post(`${API}/agents`, {
    data: { name, description: "Agent cree par Playwright" },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(resp.status()).toBe(201);
  const data = await resp.json();
  return { agent_id: data.agent_id, api_key: data.api_key };
}

export async function sendTestMetrics(
  page: Page,
  apiKey: string,
  metrics: { cpu?: number; memory?: number; disk?: number } = {}
): Promise<void> {
  await page.request.post(`${API}/metrics/ingest`, {
    data: {
      api_key: apiKey,
      hostname: "e2e-test-host",
      os_info: "Ubuntu 24.04 LTS (E2E Test)",
      ip_address: "127.0.0.1",
      cpu_pct: metrics.cpu ?? 45.0,
      mem_used_pct: metrics.memory ?? 60.0,
      mem_total_gb: 4.0,
      mem_used_gb: 2.4,
      disk_used_pct: metrics.disk ?? 30.0,
      disk_used_gb: 60.0,
      disk_total_gb: 200.0,
      network_bytes_sent: 1024.0,
      network_bytes_recv: 2048.0,
    },
    headers: { "X-Agent-Key": apiKey },
  });
}
