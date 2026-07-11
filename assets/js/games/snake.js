const BEST_SCORE_KEY = "minigames.snake.bestScore";
const BOARD_SIZE = 15;
const START_SNAKE = [
  { x: 7, y: 7 },
  { x: 6, y: 7 },
  { x: 5, y: 7 }
];
const START_DIRECTION = { x: 1, y: 0 };
const TICK_MS = 200;

export function startSnake({ stage }) {
  let snake = START_SNAKE.map((segment) => ({ ...segment }));
  let food = { x: 11, y: 7 };
  let direction = { ...START_DIRECTION };
  let nextDirection = { ...START_DIRECTION };
  let score = 0;
  let bestScore = readBestScore();
  let timerId = null;
  let isRunning = false;
  let isGameOver = false;
  let wasRunningBeforePause = false;
  let touchStart = null;

  stage.innerHTML = `
    <div class="snake-game" aria-live="polite">
      <div class="score-grid snake-score-grid">
        <div class="score-tile">
          <span class="score-label">Score</span>
          <strong id="snake-score">0</strong>
        </div>
        <div class="score-tile">
          <span class="score-label">Best</span>
          <strong id="snake-best">${bestScore}</strong>
        </div>
        <div class="score-tile">
          <span class="score-label">Speed</span>
          <strong>Easy</strong>
        </div>
      </div>

      <div class="snake-board" id="snake-board" role="img" aria-label="Snake board"></div>
      <p class="game-message" id="snake-message">Press start, A, or swipe to play.</p>
      <button class="secondary-action" id="snake-start" type="button">Start</button>
    </div>
  `;

  const boardEl = stage.querySelector("#snake-board");
  const scoreEl = stage.querySelector("#snake-score");
  const bestEl = stage.querySelector("#snake-best");
  const messageEl = stage.querySelector("#snake-message");
  const startButton = stage.querySelector("#snake-start");
  const cells = [];

  for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index += 1) {
    const cell = document.createElement("span");
    cell.className = "snake-cell";
    boardEl.append(cell);
    cells.push(cell);
  }

  function render() {
    for (const cell of cells) {
      cell.className = "snake-cell";
      cell.removeAttribute("data-snake");
      cell.removeAttribute("data-food");
    }

    snake.forEach((segment, index) => {
      const cell = cells[toIndex(segment)];
      cell.classList.add(index === 0 ? "is-head" : "is-snake");
      cell.dataset.snake = index === 0 ? "head" : "body";
    });

    const foodCell = cells[toIndex(food)];
    foodCell.classList.add("is-food");
    foodCell.dataset.food = "true";
    scoreEl.textContent = String(score);
    bestEl.textContent = String(bestScore);
  }

  function startGame() {
    if (isRunning) {
      return;
    }

    if (isGameOver) {
      resetGame();
    }

    isRunning = true;
    startButton.textContent = "Restart";
    messageEl.textContent = "Go.";
    timerId = window.setInterval(tick, TICK_MS);
  }

  function resetGame() {
    window.clearInterval(timerId);
    snake = START_SNAKE.map((segment) => ({ ...segment }));
    direction = { ...START_DIRECTION };
    nextDirection = { ...START_DIRECTION };
    food = { x: 11, y: 7 };
    score = 0;
    isRunning = false;
    isGameOver = false;
    messageEl.textContent = "Press start, A, or swipe to play.";
    startButton.textContent = "Start";
    render();
  }

  function tick() {
    direction = nextDirection;
    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    if (isCollision(head)) {
      endGame();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 1;
      food = placeFood();
    } else {
      snake.pop();
    }

    render();
  }

  function isCollision(position) {
    return (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= BOARD_SIZE ||
      position.y >= BOARD_SIZE ||
      snakeHasPosition(position)
    );
  }

  function snakeHasPosition(position) {
    return snake.some((segment) => segment.x === position.x && segment.y === position.y);
  }

  function placeFood() {
    const openCells = [];

    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        if (!snakeHasPosition({ x, y })) {
          openCells.push({ x, y });
        }
      }
    }

    return openCells[Math.floor(Math.random() * openCells.length)] || { x: 0, y: 0 };
  }

  function endGame() {
    window.clearInterval(timerId);
    timerId = null;
    isRunning = false;
    isGameOver = true;
    startButton.textContent = "Play again";

    if (score > bestScore) {
      bestScore = score;
      writeBestScore(score);
      messageEl.textContent = `Game over. New best: ${score}.`;
    } else {
      messageEl.textContent = `Game over. Score: ${score}.`;
    }

    render();
  }

  function setDirection(next) {
    if (next.x === -direction.x && next.y === -direction.y) {
      return;
    }

    nextDirection = next;

    if (!isRunning) {
      startGame();
    }
  }

  function handleKeydown(event) {
    const keyDirections = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      " ": null,
      Enter: null
    };

    if (!(event.key in keyDirections)) {
      return;
    }

    event.preventDefault();

    if (keyDirections[event.key]) {
      setDirection(keyDirections[event.key]);
      return;
    }

    startGame();
  }

  function handleTouchStart(event) {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStart = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    if (!touchStart) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      touchStart = null;
      return;
    }

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    touchStart = null;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 18) {
      startGame();
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDirection({ x: Math.sign(deltaX), y: 0 });
      return;
    }

    setDirection({ x: 0, y: Math.sign(deltaY) });
  }

  function handleControl(event) {
    if (event.detail?.control !== "a") {
      return;
    }

    event.preventDefault();
    startGame();
  }

  startButton.addEventListener("click", () => {
    if (isRunning || isGameOver) {
      resetGame();
    }

    startGame();
  });
  boardEl.addEventListener("touchstart", handleTouchStart, { passive: true });
  boardEl.addEventListener("touchend", handleTouchEnd);
  document.addEventListener("keydown", handleKeydown);
  stage.addEventListener("minigames:control", handleControl);
  render();

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
      if (wasRunningBeforePause && !isGameOver) {
        wasRunningBeforePause = false;
        startGame();
      }
    },
    cleanup() {
      window.clearInterval(timerId);
      document.removeEventListener("keydown", handleKeydown);
      stage.removeEventListener("minigames:control", handleControl);
    }
  };
}

function toIndex({ x, y }) {
  return y * BOARD_SIZE + x;
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
