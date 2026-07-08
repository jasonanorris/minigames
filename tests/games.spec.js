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
    await page.locator(`[data-card-id="${firstId}"]`).click();
    await page.locator(`[data-card-id="${secondId}"]`).click();
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
