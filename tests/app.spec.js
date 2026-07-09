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
  await expect(page.locator(".app-header")).toBeHidden();

  await page.getByRole("button", { name: "Return to game list" }).click();
  await expect(page.locator("body")).not.toHaveClass(/is-playing/);
  await expect(page.locator(".app-header")).toBeVisible();
  await expect(page.locator(".game-library")).toBeVisible();
});

test("compact header fits a narrow phone without overlap", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  const titleBox = await page.getByRole("heading", { name: "MiniGames" }).boundingBox();
  const actionsBox = await page.locator(".header-actions").boundingBox();
  const fitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth
  );

  expect(titleBox).not.toBeNull();
  expect(actionsBox).not.toBeNull();
  expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(actionsBox.x);
  expect(actionsBox.x + actionsBox.width).toBeLessThanOrEqual(320);
  expect(fitsViewport).toBe(true);
});

test("displayed version matches the app version module", async ({ page }) => {
  await page.goto("/");

  const moduleVersion = await page.evaluate(async () => {
    const { APP_VERSION } = await import("/assets/js/version.js");
    return APP_VERSION;
  });

  await expect(page.locator("#app-version")).toHaveText(`v${moduleVersion}`);
});

test("game theme colors update and return to the home theme", async ({ page }) => {
  await page.goto("/");

  const themeMeta = page.locator("#theme-color");
  await expect(themeMeta).toHaveAttribute("content", "#101820");

  await page.getByRole("button", { name: /Memory Grid/ }).click();
  await expect(themeMeta).toHaveAttribute("content", "#181c2a");
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(24, 28, 42)");

  await page.getByRole("button", { name: "Return to game list" }).click();
  await expect(themeMeta).toHaveAttribute("content", "#101820");
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(16, 24, 32)");
});

test("game launcher uses square tiles and marks placeholders unavailable", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Pick a quick game to play.")).toHaveCount(0);
  const columnCount = await page.locator(".game-list").evaluate((list) =>
    getComputedStyle(list).gridTemplateColumns.split(" ").length
  );
  const tileSizes = await page.locator(".game-card").evaluateAll((tiles) =>
    tiles.map(({ offsetWidth, offsetHeight }) => ({
      width: offsetWidth,
      height: offsetHeight
    }))
  );

  expect(columnCount).toBe(4);
  expect(tileSizes).toHaveLength(14);

  for (const { width, height } of tileSizes) {
    expect(Math.abs(width - height)).toBeLessThanOrEqual(1);
  }

  await expect(page.locator(".game-card.is-placeholder")).toHaveCount(10);
  await expect(page.getByRole("button", { name: "Snake, coming soon" })).toBeDisabled();
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
