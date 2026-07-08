const { test, expect } = require("@playwright/test");

test("app shell fits a mobile viewport and opens and closes games", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MiniGames" })).toBeVisible();
  await expect(page.locator("#app-version")).toHaveText(/^v0\.\d{2}$/);
  await expect(page.getByRole("button", { name: /Tap Race/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Reaction Time/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Quick Math/ })).toBeVisible();

  const viewportFits = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <= window.innerWidth &&
      document.documentElement.scrollHeight <= window.innerHeight
  );
  expect(viewportFits).toBe(true);

  await page.getByRole("button", { name: /Reaction Time/ }).click();
  await expect(page.getByRole("heading", { name: "Reaction Time" })).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/is-playing/);

  await page.getByRole("button", { name: "Return to game list" }).click();
  await expect(page.locator("body")).not.toHaveClass(/is-playing/);
  await expect(page.getByText("Select a game from the list")).toBeVisible();
});

test("displayed version matches the app version module", async ({ page }) => {
  await page.goto("/");

  const moduleVersion = await page.evaluate(async () => {
    const { APP_VERSION } = await import("/assets/js/version.js");
    return APP_VERSION;
  });

  await expect(page.locator("#app-version")).toHaveText(`v${moduleVersion}`);
});

test("manifest and service worker are available", async ({ page, request }) => {
  const manifestResponse = await request.get("/manifest.json");
  expect(manifestResponse.ok()).toBe(true);

  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe("MiniGames");
  expect(manifest.display).toBe("fullscreen");

  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.getRegistration().then(Boolean)))
    .toBe(true);
});
