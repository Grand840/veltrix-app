
import { test, expect } from "@playwright/test";
import { createTestAccount, loginViaUI, loginViaToken } from "./helpers";

test.describe("Landing page", () => {
  test("affiche la landing page publique sur /", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Veltrix/);
    await expect(page.getByText("Surveillez votre")).toBeVisible();
    await expect(page.getByText("Essai gratuit").first()).toBeVisible();
  });

  test("lien Connexion pointe vers /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Connexion" }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("lien Essai gratuit pointe vers /register", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/register"]').first().click();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe("Protection des routes", () => {
  test("/dashboard sans token redirige vers /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/agents sans token redirige vers /login", async ({ page }) => {
    await page.goto("/agents");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/alerts sans token redirige vers /login", async ({ page }) => {
    await page.goto("/alerts");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/settings sans token redirige vers /login", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Page Login", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Connexion")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });

  test("erreur avec mauvais mot de passe", async ({ page }) => {
    const ts = Date.now();
    const email = `wrong_${ts}@test.com`;
    await page.goto("/login");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "MauvaisPass1");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/email ou mot de passe|incorrect/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("login reussi redirige vers dashboard", async ({ page }) => {
    const { email, password } = await createTestAccount(page);
    await loginViaUI(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("bouton toggle show/hide password fonctionne", async ({ page }) => {
    await page.goto("/login");
    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.locator('button[tabindex="-1"]').click();
    await expect(passwordInput).toHaveAttribute("type", "text");
  });
});

test.describe("Page Register", () => {
  test("affiche le formulaire d'inscription", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /creer un compte/i })).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="organization_name"]')).toBeVisible();
  });

  test("indicateur de force du mot de passe s'affiche", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[id="password"]', "abc");
    await expect(page.getByText("8 caracteres minimum")).toBeVisible();
  });

  test("inscription reussie redirige vers dashboard", async ({ page }) => {
    const ts = Date.now();
    await page.goto("/register");
    await page.fill('input[id="organization_name"]', `Test Org E2E ${ts}`);
    await page.fill('input[id="email"]', `register_e2e_${ts}@test.io`);
    await page.fill('input[id="password"]', "RegisterTest1");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("Logout", () => {
  test("deconnexion redirige vers login", async ({ page }) => {
    const { email, password } = await createTestAccount(page);
    await loginViaUI(page, email, password);
    await page.getByRole("button", { name: "Passer" }).click();
    await page.getByText("Déconnexion").click();
    await expect(page).toHaveURL(/\/login/);
  });
});
