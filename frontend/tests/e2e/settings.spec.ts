
import { test, expect } from "@playwright/test";
import { createTestAccount, loginViaUI } from "./helpers";

test.describe("Page Parametres", () => {
  test("affiche le profil utilisateur", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/settings");
    await expect(page.getByText("Profil utilisateur")).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(account.email).first()).toBeVisible({ timeout: 8_000 });
  });

  test("affiche les statistiques d'organisation", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/settings");
    await expect(page.getByText("Organisation").first()).toBeVisible();
    await expect(page.getByText(/utilisation du plan/i).first()).toBeVisible();
    await expect(page.getByText(/gratuit/i).first()).toBeVisible();
  });

  test("affiche la section securite", async ({ page }) => {
    const account = await createTestAccount(page);
    await loginViaUI(page, account.email, account.password);
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Sécurité" })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText("Mot de passe")).toBeVisible({ timeout: 8_000 });
  });
});
