const BEST_SCORE_KEY = "minigames.quickMath.bestScore";
const GAME_SECONDS = 30;

export function startQuickMath({ stage }) {
  let score = 0;
  let streak = 0;
  let timeLeft = GAME_SECONDS;
  let currentAnswer = 0;
  let timerId = null;
  let isRunning = false;
  let isFinished = false;
  let wasRunningBeforePause = false;

  stage.innerHTML = `
    <div class="quick-math" aria-live="polite">
      <div class="score-grid">
        <div class="score-tile">
          <span class="score-label">Score</span>
          <strong id="math-score">0</strong>
        </div>
        <div class="score-tile">
          <span class="score-label">Time</span>
          <strong id="math-time">${GAME_SECONDS}</strong>
        </div>
        <div class="score-tile">
          <span class="score-label">Best</span>
          <strong id="math-best">${readBestScore()}</strong>
        </div>
      </div>

      <div class="math-question" id="math-question"></div>
      <div class="math-answers" id="math-answers" aria-label="Answer choices"></div>
      <p class="game-message" id="math-message">First answer starts the clock.</p>
      <button class="secondary-action" id="math-restart" type="button">Restart</button>
    </div>
  `;

  const scoreEl = stage.querySelector("#math-score");
  const timeEl = stage.querySelector("#math-time");
  const bestEl = stage.querySelector("#math-best");
  const questionEl = stage.querySelector("#math-question");
  const answersEl = stage.querySelector("#math-answers");
  const messageEl = stage.querySelector("#math-message");
  const restartButton = stage.querySelector("#math-restart");

  function showQuestion() {
    const question = createQuestion(score);
    currentAnswer = question.answer;
    questionEl.textContent = question.text;
    answersEl.innerHTML = "";

    for (const answer of question.choices) {
      const button = document.createElement("button");
      button.className = "math-answer";
      button.type = "button";
      button.dataset.answer = String(answer);
      button.textContent = String(answer);
      answersEl.append(button);
    }
  }

  function startTimer() {
    if (isRunning) {
      return;
    }

    isRunning = true;
    timerId = window.setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = String(timeLeft);

      if (timeLeft <= 0) {
        finishGame();
      }
    }, 1000);
  }

  function handleAnswer(event) {
    const button = event.target.closest(".math-answer");

    if (!button || isFinished) {
      return;
    }

    startTimer();
    const answer = Number(button.dataset.answer);

    if (answer === currentAnswer) {
      score += 1;
      streak += 1;
      scoreEl.textContent = String(score);
      messageEl.textContent = streak > 1 ? `Correct. ${streak} in a row.` : "Correct.";
    } else {
      streak = 0;
      messageEl.textContent = `The answer was ${currentAnswer}.`;
    }

    showQuestion();
  }

  function finishGame() {
    window.clearInterval(timerId);
    timerId = null;
    isRunning = false;
    isFinished = true;

    for (const button of answersEl.querySelectorAll(".math-answer")) {
      button.disabled = true;
    }

    const currentBest = readBestScore();

    if (score > currentBest) {
      writeBestScore(score);
      bestEl.textContent = String(score);
      messageEl.textContent = `New best: ${score}.`;
      return;
    }

    messageEl.textContent = `Time. You solved ${score}.`;
  }

  function restartGame() {
    window.clearInterval(timerId);
    timerId = null;
    score = 0;
    streak = 0;
    timeLeft = GAME_SECONDS;
    isRunning = false;
    isFinished = false;
    wasRunningBeforePause = false;
    scoreEl.textContent = "0";
    timeEl.textContent = String(GAME_SECONDS);
    bestEl.textContent = String(readBestScore());
    messageEl.textContent = "First answer starts the clock.";
    showQuestion();
    answersEl.querySelector(".math-answer")?.focus();
  }

  answersEl.addEventListener("click", handleAnswer);
  restartButton.addEventListener("click", restartGame);
  showQuestion();

  return {
    pause() {
      wasRunningBeforePause = isRunning;

      if (isRunning) {
        window.clearInterval(timerId);
        timerId = null;
        isRunning = false;
        messageEl.textContent = "Paused.";
      }
    },
    resume() {
      if (wasRunningBeforePause && !isFinished) {
        wasRunningBeforePause = false;
        startTimer();
      }
    },
    cleanup() {
      window.clearInterval(timerId);
      answersEl.removeEventListener("click", handleAnswer);
      restartButton.removeEventListener("click", restartGame);
    }
  };
}

function createQuestion(score) {
  const maxOperand = score < 5 ? 10 : score < 10 ? 12 : 20;
  const operators = score < 5 ? ["+", "-"] : ["+", "-", "x"];
  const operator = operators[randomInteger(0, operators.length - 1)];
  let left = randomInteger(1, maxOperand);
  let right = randomInteger(1, maxOperand);

  if (operator === "-" && right > left) {
    [left, right] = [right, left];
  }

  const answer =
    operator === "+" ? left + right : operator === "-" ? left - right : left * right;

  return {
    answer,
    choices: createChoices(answer),
    text: `${left} ${operator} ${right}`
  };
}

function createChoices(answer) {
  const choices = new Set([answer]);
  const offsets = shuffle([-10, -5, -3, -2, -1, 1, 2, 3, 5, 10]);

  for (const offset of offsets) {
    const choice = answer + offset;

    if (choice >= 0) {
      choices.add(choice);
    }

    if (choices.size === 4) {
      break;
    }
  }

  return shuffle([...choices]);
}

function randomInteger(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(0, index);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

function readBestScore() {
  try {
    const storedScore = window.localStorage.getItem(BEST_SCORE_KEY);
    const score = Number.parseInt(storedScore || "0", 10);
    return Number.isFinite(score) && score >= 0 ? score : 0;
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
