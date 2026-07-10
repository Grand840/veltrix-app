
import { test, expect } from "@playwright/test";
import { createTestAccount, loginViaUI, createTestAgent, sendTestMetrics } from "./helpers";

test.describe("Dashboard", () => {
  test("charge les cartes de statistiques", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await expect(page.getByText("En ligne")).toBeVisible();
    await expect(page.getByText("Hors ligne")).toBeVisible();
    await expect(page.getByText("En attente")).toBeVisible();
    await expect(page.getByText("Alertes actives")).toBeVisible();
  });

  test("affiche l'etat vide quand aucun agent", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await expect(page.getByText(/aucun agent/i)).toBeVisible({ timeout: 10_000 });
  });

  test("wizard onboarding s'affiche pour un nouveau compte", async ({ page }) => {
    const account = await createTestAccount(page);
    await page.goto("/login");
    await page.evaluate(() => localStorage.removeItem("veltrix_onboarding_dismissed"));
    await loginViaUI(page, account.email, account.password);
    await expect(page.getByText(/bienvenue sur veltrix/i)).toBeVisible({ timeout: 10_000 });
  });

  test("affiche les agents quand il en existe", async ({ page }) => {
    const account = await createTestAccount(page);
    await createTestAgent(page, account.token, "dashboard-test-agent");
    await loginViaUI(page, account.email, account.password);
    await expect(page.getByText("dashboard-test-agent")).toBeVisible({ timeout: 10_000 });
  });

  test("bouton Actualiser fonctionne", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    const refreshBtn = page.getByRole("button", { name: /actualiser/i });
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click({ force: true });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("navigation sidebar fonctionne", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/agents");
    await expect(page).toHaveURL(/\/agents/);
    await page.getByRole("link", { name: "Alertes" }).click({ force: true });
    await expect(page).toHaveURL(/\/alerts/);
    await page.getByRole("link", { name: /param[eè]tr[eè]s/i }).click({ force: true });
    await expect(page).toHaveURL(/\/settings/);
  });
});

test.describe("Dashboard avec metriques", () => {
  test("agent passe online apres envoi de metriques", async ({ page }) => {
    const account = await createTestAccount(page);
    const { api_key } = await createTestAgent(page, account.token, "metrics-test-agent");
    await sendTestMetrics(page, api_key, { cpu: 55, memory: 70, disk: 40 });
    await loginViaUI(page, account.email, account.password);
    await expect(page.getByText("En ligne").first()).toBeVisible({ timeout: 10_000 });
  });
});
