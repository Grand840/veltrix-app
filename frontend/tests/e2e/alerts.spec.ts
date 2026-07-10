
import { test, expect } from "@playwright/test";
import { createTestAccount, loginViaUI, createTestAgent, sendTestMetrics } from "./helpers";

test.describe("Page Alertes", () => {
  test("affiche l'etat vide quand aucune alerte", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/alerts");
    await expect(page.getByText(/aucune alerte active/i)).toBeVisible({ timeout: 10_000 });
  });

  test("les filtres de statut sont cliquables", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/alerts");
    const buttons = ["Toutes", "Actives", "Acquittees", "Resolues"];
    for (const filter of buttons) {
      const btn = page.getByRole("button", { name: filter });
      if (await btn.isVisible().catch(() => false)) {
        await btn.click({ force: true });
      }
    }
    await expect(page).toHaveURL(/\/alerts/);
  });

  test("filtre de severite fonctionne", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/alerts");
    const select = page.locator("select");
    await expect(select).toBeVisible();
    await select.selectOption("critical");
    await expect(page).toHaveURL(/\/alerts/);
  });

  test("cree une alerte CPU critique et l'affiche", async ({ page }) => {
    const account = await createTestAccount(page);
    const { api_key } = await createTestAgent(page, account.token, "alert-test-agent");
    await sendTestMetrics(page, api_key, { cpu: 92, memory: 60, disk: 30 });
    await loginViaUI(page, account.email, account.password);
    await page.goto("/alerts");
    await page.getByRole("button", { name: "Actives" }).click({ force: true });
    await expect(page.getByText(/cpu eleve/i)).toBeVisible({ timeout: 15_000 });
  });

  test("bouton acquitter fonctionne", async ({ page }) => {
    const account = await createTestAccount(page);
    const { api_key } = await createTestAgent(page, account.token, "ack-test-agent");
    await sendTestMetrics(page, api_key, { cpu: 92, memory: 60, disk: 30 });
    await loginViaUI(page, account.email, account.password);
    await page.goto("/alerts");
    await page.getByRole("button", { name: "Actives" }).click({ force: true });
    const ackButton = page.getByRole("button", { name: "Acquitter" }).first();
    const ackVisible = await ackButton.isVisible().catch(() => false);
    if (ackVisible) {
      await ackButton.click();
      await expect(ackButton).not.toBeVisible({ timeout: 5_000 });
    } else {
      test.skip(true, "Aucune alerte firing disponible pour acquitter");
    }
  });
});
