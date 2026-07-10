
import { test, expect } from "@playwright/test";
import { createTestAccount, loginViaUI, createTestAgent, sendTestMetrics } from "./helpers";

test.describe("Page Agents", () => {
  test("affiche la liste des agents", async ({ page }) => {
    const account = await createTestAccount(page);
    await createTestAgent(page, account.token, "list-agent-01");
    await loginViaUI(page, account.email, account.password);
    await page.goto("/agents");
    await expect(page.getByText("list-agent-01")).toBeVisible({ timeout: 10_000 });
  });

  test("filtre par statut fonctionne", async ({ page }) => {
    const account = await createTestAccount(page);
    await createTestAgent(page, account.token, "filter-test-agent");
    await loginViaUI(page, account.email, account.password);
    await page.goto("/agents");
    await page.getByRole("button", { name: "En attente" }).click({ force: true });
    await expect(page.getByText("filter-test-agent")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "En ligne" }).click({ force: true });
    await expect(page).toHaveURL(/\/agents/);
  });

  test("recherche filtre les agents", async ({ page }) => {
    const account = await createTestAccount(page);
    await createTestAgent(page, account.token, "searchable-unique-agent");
    await loginViaUI(page, account.email, account.password);
    await page.goto("/agents");
    await page.fill('input[placeholder*="Rechercher"]', "searchable-unique");
    await expect(page.getByText("searchable-unique-agent")).toBeVisible({ timeout: 8_000 });
    await page.fill('input[placeholder*="Rechercher"]', "xxxnonexistentxxx");
    await expect(page.getByText(/aucun agent ne correspond/i)).toBeVisible({ timeout: 5_000 });
  });

  test("bouton Ajouter ouvre la page de creation", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/agents");
    await page.getByRole("link", { name: "Ajouter" }).first().click();
    await expect(page).toHaveURL(/\/agents\/new/);
  });

  test("creation d'agent depuis la page /agents/new", async ({ page }) => {
    const ts = Date.now();
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/agents/new");
    await page.fill('input[id="name"]', `e2e-created-${ts}`);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/vltx_/).first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Page detail agent", () => {
  test("affiche les informations systeme apres metriques", async ({ page }) => {
    const account = await createTestAccount(page);
    const { agent_id, api_key } = await createTestAgent(page, account.token, "detail-test-agent");
    await sendTestMetrics(page, api_key, { cpu: 42, memory: 65, disk: 25 });
    await loginViaUI(page, account.email, account.password);
    await page.goto(`/agents/${agent_id}`);
    await expect(page.getByText("e2e-test-host")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/en ligne|en attente/i)).toBeVisible({ timeout: 10_000 });
  });

  test("selecteur de plage temporelle fonctionne", async ({ page }) => {
    const account = await createTestAccount(page);
    const { agent_id, api_key } = await createTestAgent(page, account.token, "range-test-agent");
    await sendTestMetrics(page, api_key);
    await loginViaUI(page, account.email, account.password);
    await page.goto(`/agents/${agent_id}`);
    await page.getByRole("button", { name: "24h" }).click({ force: true });
    await expect(page.getByRole("button", { name: "24h" })).toHaveClass(/bg-white/);
    await page.getByRole("button", { name: "7j" }).click({ force: true });
    await expect(page.getByRole("button", { name: "7j" })).toHaveClass(/bg-white/);
  });
});
