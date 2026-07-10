const { test, expect } = require("@playwright/test");

test("Tap Race starts, scores, restarts, and reads the saved best", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("minigames.tapRace.bestScore", "12");
  });
  await page.goto("/");
  await launchGame(page, "Tap Race");

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

test("Tap Race pauses while the app is hidden and resumes with its time intact", async ({
  page
}) => {
  await page.goto("/");
  await launchGame(page, "Tap Race");

  await page.locator("#tap-target").click();
  await expect(page.locator("#tap-message")).toHaveText("Go.");
  await setDocumentVisibility(page, "hidden");
  await expect(page.locator("#tap-message")).toHaveText("Paused.");
  const pausedTime = await page.locator("#tap-time").textContent();

  await page.waitForTimeout(1200);
  await expect(page.locator("#tap-time")).toHaveText(pausedTime);

  await setDocumentVisibility(page, "visible");
  await expect(page.locator("#tap-message")).toHaveText("Go.");
  await expect(page.locator("#tap-time")).not.toHaveText(pausedTime, { timeout: 1500 });
});

test("Reaction Time handles early taps", async ({ page }) => {
  await page.goto("/");
  await launchGame(page, "Reaction Time");

  const target = page.locator("#reaction-target");
  await target.click();
  await expect(target).toHaveClass(/is-waiting/);
  await target.click();

  await expect(page.locator("#reaction-prompt")).toHaveText("Too soon");
  await expect(page.locator("#reaction-detail")).toHaveText("Tap to try again");
});

test("Reaction Time records and reloads a best time", async ({ page }) => {
  await page.goto("/");
  await launchGame(page, "Reaction Time");

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
  await expect(page.locator("body")).toHaveClass(/is-playing/);
  await expect(page.locator("#reaction-best")).toHaveText(`${savedBest} ms`);
});

test("Memory Grid completes, saves its best, and starts a new board", async ({ page }) => {
  await page.goto("/");
  await launchGame(page, "Memory Grid");

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
  await launchGame(page, "Memory Grid");

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
  await launchGame(page, "Memory Grid");

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

test("Quick Math scores answers, saves its best, and restarts", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await launchGame(page, "Quick Math");

  const correctAnswer = await readMathAnswer(page);
  await page.getByRole("button", { name: String(correctAnswer), exact: true }).click();
  await expect(page.locator("#math-score")).toHaveText("1");
  await expect(page.locator("#math-message")).toHaveText("Correct.");

  const nextAnswer = await readMathAnswer(page);
  const wrongButton = page.locator(".math-answer").filter({
    hasNotText: new RegExp(`^${nextAnswer}$`)
  }).first();
  await wrongButton.click();
  await expect(page.locator("#math-score")).toHaveText("1");
  await expect(page.locator("#math-message")).toHaveText(`The answer was ${nextAnswer}.`);

  await page.clock.runFor(30000);
  await expect(page.locator("#math-time")).toHaveText("0");
  await expect(page.locator("#math-message")).toHaveText("New best: 1.");
  await expect(page.locator(".math-answer:disabled")).toHaveCount(4);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("minigames.quickMath.bestScore")))
    .toBe("1");

  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.locator("#math-score")).toHaveText("0");
  await expect(page.locator("#math-time")).toHaveText("30");
  await expect(page.locator("#math-best")).toHaveText("1");
  await expect(page.locator(".math-answer:enabled")).toHaveCount(4);
});

test("The Wheel edits prizes, locks settings while spinning, and announces a winner", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await launchGame(page, "The Wheel");
  await expect(page.locator("body")).toHaveClass(/is-small-game/);
  await expect(page.locator("#small-game-back")).toBeVisible();

  const firstPrize = page.getByRole("textbox", { name: "Prize 1" });
  const pointer = page.locator(".wheel-pointer");
  await expect(pointer).toHaveAttribute("data-prize-index", "0");
  await firstPrize.fill("Arcade Token");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByRole("textbox", { name: "Prize 6" })).toBeVisible();

  await page.getByRole("button", { name: "Spin the prize wheel" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#win-prize")).not.toBeEmpty();
  await expect(pointer).toHaveAttribute("data-prize-index", /^\d+$/);
  await expect(firstPrize).toBeEnabled();
});

async function launchGame(page, name) {
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/is-playing/);
}

async function setDocumentVisibility(page, state) {
  await page.evaluate((visibilityState) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: visibilityState
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}

async function readMathAnswer(page) {
  const expression = await page.locator("#math-question").textContent();
  const [left, operator, right] = expression.split(" ");
  const first = Number(left);
  const second = Number(right);

  if (operator === "+") {
    return first + second;
  }

  if (operator === "-") {
    return first - second;
  }

  return first * second;
}
