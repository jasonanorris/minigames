const { test, expect } = require("@playwright/test");

test("app shell fits a mobile viewport and opens and closes games", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MiniGames" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Tap Race/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Reaction Time/ })).toBeVisible();

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
