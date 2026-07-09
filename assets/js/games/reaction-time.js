const BEST_TIME_KEY = "minigames.reactionTime.bestTime";
const MIN_WAIT_MS = 1500;
const MAX_WAIT_MS = 4000;

export function startReactionTime({ stage }) {
  let state = "ready";
  let waitTimerId = null;
  let waitTimeRemaining = 0;
  let waitTimeStarted = 0;
  let signalTime = 0;

  stage.innerHTML = `
    <div class="reaction-time" aria-live="polite">
      <div class="reaction-stats">
        <span class="score-label">Best time</span>
        <strong id="reaction-best">${formatTime(readBestTime())}</strong>
      </div>

      <button class="reaction-target is-ready" id="reaction-target" type="button">
        <strong id="reaction-prompt">Start</strong>
        <span id="reaction-detail">Tap to begin</span>
      </button>

      <p class="game-message" id="reaction-message">Wait for green, then tap as quickly as you can.</p>
    </div>
  `;

  const bestEl = stage.querySelector("#reaction-best");
  const targetButton = stage.querySelector("#reaction-target");
  const promptEl = stage.querySelector("#reaction-prompt");
  const detailEl = stage.querySelector("#reaction-detail");
  const messageEl = stage.querySelector("#reaction-message");

  function beginRound() {
    state = "waiting";
    targetButton.className = "reaction-target is-waiting";
    promptEl.textContent = "Wait";
    detailEl.textContent = "Do not tap yet";
    messageEl.textContent = "Watch for green.";

    const delay = MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS);
    waitTimeRemaining = delay;
    waitTimeStarted = performance.now();
    waitTimerId = window.setTimeout(showSignal, delay);
  }

  function showSignal() {
    waitTimerId = null;
    waitTimeRemaining = 0;
    state = "go";
    signalTime = performance.now();
    targetButton.className = "reaction-target is-go";
    promptEl.textContent = "Tap!";
    detailEl.textContent = "Now";
    messageEl.textContent = "Go.";
  }

  function handleTargetTap() {
    if (state === "ready" || state === "result") {
      beginRound();
      return;
    }

    if (state === "waiting") {
      window.clearTimeout(waitTimerId);
      waitTimerId = null;
      state = "result";
      targetButton.className = "reaction-target is-early";
      promptEl.textContent = "Too soon";
      detailEl.textContent = "Tap to try again";
      messageEl.textContent = "Wait until the target turns green.";
      return;
    }

    const reactionTime = Math.round(performance.now() - signalTime);
    const currentBest = readBestTime();
    state = "result";
    targetButton.className = "reaction-target is-result";
    promptEl.textContent = `${reactionTime} ms`;
    detailEl.textContent = "Tap to play again";

    if (currentBest === null || reactionTime < currentBest) {
      writeBestTime(reactionTime);
      bestEl.textContent = formatTime(reactionTime);
      messageEl.textContent = "New best time.";
      return;
    }

    messageEl.textContent = `Your reaction time was ${reactionTime} milliseconds.`;
  }

  targetButton.addEventListener("click", handleTargetTap);
  targetButton.focus();

  return {
    pause() {
      if (state === "waiting") {
        window.clearTimeout(waitTimerId);
        waitTimerId = null;
        waitTimeRemaining = Math.max(
          0,
          waitTimeRemaining - (performance.now() - waitTimeStarted)
        );
        state = "paused-waiting";
      } else if (state === "go") {
        state = "paused-reset";
      } else {
        return;
      }

      targetButton.className = "reaction-target is-ready";
      promptEl.textContent = "Paused";
      detailEl.textContent = "Return to continue";
      messageEl.textContent = "Round paused.";
    },
    resume() {
      if (state === "paused-waiting") {
        state = "waiting";
        waitTimeStarted = performance.now();
        waitTimerId = window.setTimeout(showSignal, waitTimeRemaining);
        targetButton.className = "reaction-target is-waiting";
        promptEl.textContent = "Wait";
        detailEl.textContent = "Do not tap yet";
        messageEl.textContent = "Watch for green.";
      } else if (state === "paused-reset") {
        state = "ready";
        targetButton.className = "reaction-target is-ready";
        promptEl.textContent = "Start";
        detailEl.textContent = "Tap to begin";
        messageEl.textContent = "Round reset after pause.";
      }
    },
    cleanup() {
      window.clearTimeout(waitTimerId);
      targetButton.removeEventListener("click", handleTargetTap);
    }
  };
}

function formatTime(time) {
  return time === null ? "--" : `${time} ms`;
}

function readBestTime() {
  try {
    const storedTime = window.localStorage.getItem(BEST_TIME_KEY);

    if (storedTime === null) {
      return null;
    }

    const time = Number.parseInt(storedTime, 10);
    return Number.isFinite(time) && time >= 0 ? time : null;
  } catch {
    return null;
  }
}

function writeBestTime(time) {
  try {
    window.localStorage.setItem(BEST_TIME_KEY, String(time));
  } catch {
    // Some browser privacy modes disable local storage. The game still works.
  }
}
