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
  await expect(page.locator("body")).toHaveClass(/is-small-game/);
  await expect(page.locator(".app-header")).toBeVisible();
  await expect(page.locator(".game-library")).toBeHidden();
  await expect(page.locator("#small-game-back")).toBeVisible();

  await page.getByRole("button", { name: "Return to game list" }).click();
  await expect(page.locator("body")).not.toHaveClass(/is-playing/);
  await expect(page.locator("body")).not.toHaveClass(/is-small-game/);
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

test("CSS A and B controls operate a small game", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tap Race", exact: true }).click();

  await expect(page.locator("body")).toHaveClass(/is-small-game/);
  await expect(page.locator("#tap-score")).toHaveText("0");
  await page.getByRole("button", { name: "A button" }).click();
  await expect(page.locator("#tap-score")).toHaveText("1");

  await page.getByRole("button", { name: "B button" }).click();
  await expect(page.locator("body")).not.toHaveClass(/is-playing/);
  await expect(page.locator(".game-library")).toBeVisible();
});

test("launcher and game adapt to phone rotation and viewport height changes", async ({
  page
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");

  await expect(page.locator(".game-library")).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  ).toBe(true);

  await page.getByRole("button", { name: "Quick Math", exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/is-playing/);
  await expect(page.locator("#math-answers")).toBeVisible();

  await page.setViewportSize({ width: 390, height: 700 });
  await expect(page.locator("#math-answers")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= window.innerWidth &&
        document.querySelector(".app-shell").getBoundingClientRect().height <=
          window.innerHeight
    )
  ).toBe(true);
});

test("connectivity indicator follows browser online and offline events", async ({
  context,
  page
}) => {
  await page.goto("/");

  const status = page.locator("#network-status");
  await expect(status).toHaveAttribute("aria-label", "Online");
  await expect(status).not.toHaveClass(/is-offline/);

  await context.setOffline(true);
  await expect(status).toHaveAttribute("aria-label", "Offline");
  await expect(status).toHaveClass(/is-offline/);

  await context.setOffline(false);
  await expect(status).toHaveAttribute("aria-label", "Online");
  await expect(status).not.toHaveClass(/is-offline/);
});

test("browser history moves between the launcher and a game", async ({ page }) => {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => history.state))
    .toEqual({ view: "launcher", guarded: true });

  await page.getByRole("button", { name: "Tap Race", exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/is-playing/);
  await expect
    .poll(() => page.evaluate(() => history.state))
    .toEqual({ view: "game", gameId: "tap-race" });

  await page.goBack();
  await expect(page.locator("body")).not.toHaveClass(/is-playing/);
  await expect(page.locator(".game-library")).toBeVisible();

  await page.goForward();
  await expect(page.locator("body")).toHaveClass(/is-playing/);
  await expect(page.getByRole("heading", { name: "Tap Race" })).toBeVisible();

  await page.getByRole("button", { name: "Return to game list" }).click();
  await expect(page.locator("body")).not.toHaveClass(/is-playing/);
});

test("Back on the launcher stays inside the app instead of showing a blank page", async ({
  page
}) => {
  await page.goto("/");
  await page.goBack();

  await expect(page.getByRole("heading", { name: "MiniGames" })).toBeVisible();
  await expect(page.locator(".game-library")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => history.state))
    .toEqual({ view: "launcher", guarded: true });
});

test("Back on a restored launcher history state stays inside the app", async ({
  page
}) => {
  await page.addInitScript(() => {
    history.replaceState({ view: "launcher", guarded: true }, "", location.href);
  });
  await page.goto("/");
  await page.goBack();

  await expect(page.getByRole("heading", { name: "MiniGames" })).toBeVisible();
  await expect(page.locator(".game-library")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => history.state))
    .toEqual({ view: "launcher", guarded: true });
});

test("selected tile animates without shifting the launcher grid", async ({ page }) => {
  await page.goto("/");

  const tile = page.getByRole("button", { name: "Tap Race", exact: true });
  const before = await tile.boundingBox();
  await tile.click();

  await expect(tile).toHaveClass(/is-launching/);
  const during = await tile.boundingBox();
  expect(before).not.toBeNull();
  expect(during).not.toBeNull();
  expect(Math.abs(before.x - during.x)).toBeLessThan(4);
  expect(Math.abs(before.y - during.y)).toBeLessThan(4);
  await expect(page.locator("body")).toHaveClass(/is-playing/);
});

test("launcher restores its scroll position and selected tile focus", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 320 });
  await page.goto("/");

  const savedScrollTop = await page.locator(".game-library").evaluate((library) => {
    library.scrollTop = library.scrollHeight;
    return library.scrollTop;
  });
  expect(savedScrollTop).toBeGreaterThan(0);

  await page.locator('[data-game-id="tap-race"]').evaluate((tile) => tile.click());
  await expect(page.locator("body")).toHaveClass(/is-playing/);
  await page.goBack();
  await expect(page.locator("body")).not.toHaveClass(/is-playing/);

  await expect
    .poll(() => page.locator(".game-library").evaluate((library) => library.scrollTop))
    .toBe(savedScrollTop);
  await expect
    .poll(() =>
      page.evaluate(() => document.activeElement?.dataset.gameId || null)
    )
    .toBe("tap-race");
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
  await expect(page.locator("body")).not.toHaveClass(/is-small-game/);
  await expect(page.locator(".app-header")).toBeHidden();
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
  expect(tileSizes).toHaveLength(16);

  for (const { width, height } of tileSizes) {
    expect(Math.abs(width - height)).toBeLessThanOrEqual(1);
  }

  await expect(page.locator(".game-card.is-placeholder")).toHaveCount(8);
  await expect(page.getByRole("button", { name: "Snake", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Tic Tac Toe", exact: true })).toBeEnabled();
});

test("manifest and service worker are available", async ({ page, request }) => {
  const manifestResponse = await request.get("/manifest.json");
  const serviceWorkerResponse = await request.get("/sw.js");
  expect(manifestResponse.ok()).toBe(true);
  expect(serviceWorkerResponse.ok()).toBe(true);

  const manifest = await manifestResponse.json();
  const serviceWorker = await serviceWorkerResponse.text();
  expect(manifest.name).toBe("MiniGames");
  expect(manifest.display).toBe("fullscreen");
  expect(manifest.orientation).toBe("any");
  expect(serviceWorker).toContain('self.addEventListener("message"');
  expect(serviceWorker).toContain('event.data?.type === "SKIP_WAITING"');
  expect(serviceWorker).toContain("hasLegacyCache");

  await page.goto("/");
  await expect(page.locator("#app-version")).toHaveAttribute("title", "Refresh app");
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.getRegistration().then(Boolean)))
    .toBe(true);
});

test("cached app reloads offline and launches a game", async ({ context, page }) => {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const cacheNames = await caches.keys();
        const appCache = cacheNames.find((name) => name.startsWith("minigames-app-v"));

        if (!appCache) {
          return false;
        }

        const cache = await caches.open(appCache);
        const requiredPaths = [
          "/index.html",
          "/assets/css/styles.css",
          "/assets/js/app.js",
          "/assets/js/games/memory-grid.js"
        ];
        const responses = await Promise.all(requiredPaths.map((path) => cache.match(path)));
        return responses.every(Boolean);
      })
    )
    .toBe(true);

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "MiniGames" })).toBeVisible();
  await expect(page.locator("#network-status")).toHaveAttribute("aria-label", "Offline");
  await page.getByRole("button", { name: "Memory Grid", exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/is-playing/);
  await expect(page.locator(".memory-grid")).toBeVisible();

  await context.setOffline(false);
});
