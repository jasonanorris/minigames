const BEST_SCORE_KEY = "minigames.tapRace.bestScore";
const GAME_SECONDS = 10;

export function startTapRace({ stage }) {
  let score = 0;
  let timeLeft = GAME_SECONDS;
  let timerId = null;
  let isRunning = false;

  const bestScore = readBestScore();

  stage.innerHTML = `
    <div class="tap-race" aria-live="polite">
      <div class="score-grid">
        <div class="score-tile">
          <span class="score-label">Score</span>
          <strong id="tap-score">0</strong>
        </div>
        <div class="score-tile">
          <span class="score-label">Time</span>
          <strong id="tap-time">${GAME_SECONDS}</strong>
        </div>
        <div class="score-tile">
          <span class="score-label">Best</span>
          <strong id="tap-best">${bestScore}</strong>
        </div>
      </div>

      <button class="tap-target" id="tap-target" type="button">
        <span>Tap</span>
      </button>

      <p class="game-message" id="tap-message">First tap starts the clock.</p>

      <button class="secondary-action" id="tap-restart" type="button">Restart</button>
    </div>
  `;

  const scoreEl = stage.querySelector("#tap-score");
  const timeEl = stage.querySelector("#tap-time");
  const bestEl = stage.querySelector("#tap-best");
  const targetButton = stage.querySelector("#tap-target");
  const messageEl = stage.querySelector("#tap-message");
  const restartButton = stage.querySelector("#tap-restart");

  function startTimer() {
    if (isRunning) {
      return;
    }

    isRunning = true;
    messageEl.textContent = "Go.";
    timerId = window.setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = String(timeLeft);

      if (timeLeft <= 0) {
        finishGame();
      }
    }, 1000);
  }

  function handleTap() {
    if (timeLeft <= 0) {
      return;
    }

    startTimer();
    score += 1;
    scoreEl.textContent = String(score);
  }

  function finishGame() {
    window.clearInterval(timerId);
    timerId = null;
    isRunning = false;
    targetButton.disabled = true;

    const currentBest = readBestScore();

    if (score > currentBest) {
      writeBestScore(score);
      bestEl.textContent = String(score);
      messageEl.textContent = `New best: ${score}.`;
      return;
    }

    messageEl.textContent = `Time. You scored ${score}.`;
  }

  function restartGame() {
    window.clearInterval(timerId);
    timerId = null;
    score = 0;
    timeLeft = GAME_SECONDS;
    isRunning = false;
    scoreEl.textContent = "0";
    timeEl.textContent = String(GAME_SECONDS);
    bestEl.textContent = String(readBestScore());
    targetButton.disabled = false;
    messageEl.textContent = "First tap starts the clock.";
    targetButton.focus();
  }

  targetButton.addEventListener("click", handleTap);
  restartButton.addEventListener("click", restartGame);

  return () => {
    window.clearInterval(timerId);
    targetButton.removeEventListener("click", handleTap);
    restartButton.removeEventListener("click", restartGame);
  };
}

function readBestScore() {
  try {
    const storedScore = window.localStorage.getItem(BEST_SCORE_KEY);
    const score = Number.parseInt(storedScore || "0", 10);

    return Number.isFinite(score) ? score : 0;
  } catch {
    return 0;
  }
}

function writeBestScore(score) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Some browser privacy modes disable local storage. The game still works.
  }
}
