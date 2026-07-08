const { test, expect } = require("@playwright/test");

test("Tap Race starts, scores, restarts, and reads the saved best", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("minigames.tapRace.bestScore", "12");
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Tap Race/ }).click();

  await expect(page.locator("#tap-best")).toHaveText("12");
  await page.locator("#tap-target").click();
  await expect(page.locator("#tap-score")).toHaveText("1");
  await expect(page.locator("#tap-message")).toHaveText("Go.");
  await expect(page.locator("#tap-time")).toHaveText("9", { timeout: 1500 });

  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.locator("#tap-score")).toHaveText("0");
  await expect(page.locator("#tap-time")).toHaveText("10");
  await expect(page.locator("#tap-message")).toHaveText("First tap starts the clock.");
});

test("Reaction Time handles early taps", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Reaction Time/ }).click();

  const target = page.locator("#reaction-target");
  await target.click();
  await expect(target).toHaveClass(/is-waiting/);
  await target.click();

  await expect(page.locator("#reaction-prompt")).toHaveText("Too soon");
  await expect(page.locator("#reaction-detail")).toHaveText("Tap to try again");
});

test("Reaction Time records and reloads a best time", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Reaction Time/ }).click();

  const target = page.locator("#reaction-target");
  await target.click();
  await expect(target).toHaveClass(/is-go/, { timeout: 4500 });
  await page.waitForTimeout(50);
  await target.click();

  await expect(page.locator("#reaction-message")).toHaveText("New best time.");
  const savedBest = await page.evaluate(() =>
    localStorage.getItem("minigames.reactionTime.bestTime")
  );
  expect(Number(savedBest)).toBeGreaterThan(0);

  await page.reload();
  await page.getByRole("button", { name: /Reaction Time/ }).click();
  await expect(page.locator("#reaction-best")).toHaveText(`${savedBest} ms`);
});

test("Memory Grid completes, saves its best, and starts a new board", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Memory Grid/ }).click();

  const pairs = await page.locator(".memory-card").evaluateAll((cards) => {
    const groupedCards = {};

    for (const card of cards) {
      groupedCards[card.dataset.pair] ||= [];
      groupedCards[card.dataset.pair].push(card.dataset.cardId);
    }

    return Object.values(groupedCards);
  });

  for (const [firstId, secondId] of pairs) {
    const pair = await page.locator(`[data-card-id="${firstId}"]`).getAttribute("data-pair");
    await page.locator(`[data-card-id="${firstId}"]`).click();
    await expect(page.locator(`[data-card-id="${firstId}"]`)).not.toHaveClass(/is-activating/);
    await page.locator(`[data-card-id="${secondId}"]`).click();
    await expect(page.locator(`[data-pair="${pair}"].is-matched`)).toHaveCount(2);
  }

  await expect(page.locator("#memory-pairs")).toHaveText("8 / 8");
  await expect(page.locator("#memory-moves")).toHaveText("8");
  await expect(page.locator("#memory-best")).toHaveText("8");
  await expect(page.locator("#memory-message")).toHaveText("New best: 8 moves.");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("minigames.memoryGrid.bestMoves")))
    .toBe("8");

  await page.getByRole("button", { name: "New game" }).click();
  await expect(page.locator("#memory-moves")).toHaveText("0");
  await expect(page.locator("#memory-pairs")).toHaveText("0 / 8");
  await expect(page.locator("#memory-best")).toHaveText("8");
  await expect(page.locator(".memory-card.is-revealed")).toHaveCount(0);
});

test("Memory Grid cards stay the same size when revealed", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Memory Grid/ }).click();

  const cards = page.locator(".memory-card");
  const sizesBefore = await cards.evaluateAll((items) =>
    items.map(({ offsetWidth, offsetHeight }) => ({ width: offsetWidth, height: offsetHeight }))
  );

  await cards.first().click();

  const sizesAfter = await cards.evaluateAll((items) =>
    items.map(({ offsetWidth, offsetHeight }) => ({ width: offsetWidth, height: offsetHeight }))
  );
  expect(sizesAfter).toEqual(sizesBefore);
});

test("Memory Grid quick tap plays the full animation without resizing its grid track", async ({
  page
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Memory Grid/ }).click();

  const card = page.locator(".memory-card").first();
  const sizeBefore = await card.evaluate(({ offsetWidth, offsetHeight }) => ({
    width: offsetWidth,
    height: offsetHeight
  }));

  await card.click();
  await expect(card).toHaveClass(/is-activating/);
  await page.waitForTimeout(90);

  const animatedState = await card.evaluate((element) => ({
    width: element.offsetWidth,
    height: element.offsetHeight,
    transform: getComputedStyle(element).transform
  }));

  expect({ width: animatedState.width, height: animatedState.height }).toEqual(sizeBefore);
  expect(animatedState.transform).not.toBe("none");
  expect(animatedState.transform).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  await expect(card).not.toHaveClass(/is-activating/);
  await expect(card).toHaveClass(/is-revealed/);
});
