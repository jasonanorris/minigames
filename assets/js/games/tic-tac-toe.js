const SCORE_KEY = "minigames.ticTacToe.score";
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export function startTicTacToe({ stage }) {
  let board = Array(9).fill("");
  let currentPlayer = "X";
  let isFinished = false;
  let winningLine = [];
  let score = readScore();
  let focusFrame = null;

  stage.innerHTML = `
    <div class="tic-tac-toe" aria-live="polite">
      <div class="score-grid tic-score-grid">
        <div class="score-tile tic-score-tile">
          <span class="score-label">X Wins</span>
          <strong id="tic-score-x">${score.X}</strong>
        </div>
        <div class="score-tile tic-score-tile">
          <span class="score-label">Ties</span>
          <strong id="tic-score-ties">${score.ties}</strong>
        </div>
        <div class="score-tile tic-score-tile">
          <span class="score-label">O Wins</span>
          <strong id="tic-score-o">${score.O}</strong>
        </div>
      </div>

      <p class="game-message tic-message" id="tic-message">X goes first.</p>

      <div class="tic-board" id="tic-board" role="grid" aria-label="Tic Tac Toe board"></div>

      <button class="secondary-action tic-restart" id="tic-restart" type="button">New round</button>
    </div>
  `;

  const boardEl = stage.querySelector("#tic-board");
  const messageEl = stage.querySelector("#tic-message");
  const restartButton = stage.querySelector("#tic-restart");
  const xScoreEl = stage.querySelector("#tic-score-x");
  const oScoreEl = stage.querySelector("#tic-score-o");
  const tieScoreEl = stage.querySelector("#tic-score-ties");

  function renderBoard() {
    boardEl.innerHTML = "";

    board.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.className = "tic-cell";
      cell.type = "button";
      cell.dataset.index = String(index);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", getCellLabel(index, value));
      cell.textContent = value;
      cell.disabled = isFinished || Boolean(value);

      if (value) {
        cell.classList.add(`is-${value.toLowerCase()}`);
      }

      if (winningLine.includes(index)) {
        cell.classList.add("is-winning");
      }

      boardEl.append(cell);
    });
  }

  function handleCellClick(event) {
    const cell = event.target.closest(".tic-cell");

    if (!cell || isFinished) {
      return;
    }

    const index = Number.parseInt(cell.dataset.index || "-1", 10);

    if (!Number.isInteger(index) || board[index]) {
      return;
    }

    board[index] = currentPlayer;
    const result = getGameResult();

    if (result.winner) {
      isFinished = true;
      winningLine = result.line;
      score[result.winner] += 1;
      writeScore(score);
      renderScore();
      messageEl.textContent = `${result.winner} wins!`;
      renderBoard();
      restartButton.focus();
      return;
    }

    if (result.isDraw) {
      isFinished = true;
      score.ties += 1;
      writeScore(score);
      renderScore();
      messageEl.textContent = "Cat's game.";
      renderBoard();
      restartButton.focus();
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    messageEl.textContent = `${currentPlayer}'s turn.`;
    renderBoard();
    focusFirstOpenCell();
  }

  function restart() {
    board = Array(9).fill("");
    currentPlayer = "X";
    isFinished = false;
    winningLine = [];
    messageEl.textContent = "X goes first.";
    renderBoard();
    focusFirstOpenCell();
  }

  function getGameResult() {
    for (const line of WIN_LINES) {
      const [first, second, third] = line;

      if (board[first] && board[first] === board[second] && board[first] === board[third]) {
        return { winner: board[first], line, isDraw: false };
      }
    }

    return { winner: "", line: [], isDraw: board.every(Boolean) };
  }

  function renderScore() {
    xScoreEl.textContent = String(score.X);
    oScoreEl.textContent = String(score.O);
    tieScoreEl.textContent = String(score.ties);
  }

  function focusFirstOpenCell() {
    boardEl.querySelector(".tic-cell:not(:disabled)")?.focus();
  }

  function getCellLabel(index, value) {
    const row = Math.floor(index / 3) + 1;
    const column = (index % 3) + 1;

    return value ? `${value} at row ${row}, column ${column}` : `Empty row ${row}, column ${column}`;
  }

  boardEl.addEventListener("click", handleCellClick);
  restartButton.addEventListener("click", restart);
  renderBoard();
  focusFrame = window.requestAnimationFrame(focusFirstOpenCell);

  return {
    cleanup() {
      window.cancelAnimationFrame(focusFrame);
      boardEl.removeEventListener("click", handleCellClick);
      restartButton.removeEventListener("click", restart);
    }
  };
}

function readScore() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SCORE_KEY) || "{}");
    const savedScore = parsed && typeof parsed === "object" ? parsed : {};

    return {
      X: Number.isFinite(savedScore.X) ? savedScore.X : 0,
      O: Number.isFinite(savedScore.O) ? savedScore.O : 0,
      ties: Number.isFinite(savedScore.ties) ? savedScore.ties : 0
    };
  } catch {
    return { X: 0, O: 0, ties: 0 };
  }
}

function writeScore(score) {
  try {
    window.localStorage.setItem(SCORE_KEY, JSON.stringify(score));
  } catch {
    // Some browser privacy modes disable local storage. The game still works.
  }
}
