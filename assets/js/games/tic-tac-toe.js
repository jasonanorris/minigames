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
const FIREWORK_COLORS = ["#ff4d8d", "#ffd166", "#06d6a0", "#4cc9f0", "#9b5de5", "#f78c6b"];
const FIREWORK_COUNT = 84;
const REDUCED_MOTION_FIREWORK_COUNT = 30;
const HORN_VOLUME = 0.32;

export function startTicTacToe({ stage }) {
  let board = Array(9).fill("");
  let currentPlayer = "X";
  let isFinished = false;
  let winningLine = [];
  let score = readScore();
  let focusFrame = null;
  let fireworksTimer = null;
  let audioContext = null;

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

      <dialog class="win-modal tic-win-modal" id="tic-win-modal" aria-labelledby="tic-win-title">
        <div class="tic-fireworks" id="tic-fireworks" aria-hidden="true"></div>
        <div class="win-burst tic-win-burst" aria-hidden="true">✹</div>
        <p class="win-kicker">Winner!</p>
        <h3 id="tic-win-title">X wins!</h3>
        <strong class="win-prize tic-winner" id="tic-winner">Player X</strong>
        <button class="primary-action" id="tic-modal-new-round" type="button">New round</button>
      </dialog>
    </div>
  `;

  const boardEl = stage.querySelector("#tic-board");
  const messageEl = stage.querySelector("#tic-message");
  const restartButton = stage.querySelector("#tic-restart");
  const xScoreEl = stage.querySelector("#tic-score-x");
  const oScoreEl = stage.querySelector("#tic-score-o");
  const tieScoreEl = stage.querySelector("#tic-score-ties");
  const winModal = stage.querySelector("#tic-win-modal");
  const winTitle = stage.querySelector("#tic-win-title");
  const winnerName = stage.querySelector("#tic-winner");
  const modalNewRoundButton = stage.querySelector("#tic-modal-new-round");
  const fireworks = stage.querySelector("#tic-fireworks");

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
      showWinModal(result.winner);
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
    closeWinModal();
    board = Array(9).fill("");
    currentPlayer = "X";
    isFinished = false;
    winningLine = [];
    messageEl.textContent = "X goes first.";
    renderBoard();
    focusFirstOpenCell();
  }

  function showWinModal(winner) {
    winTitle.textContent = `${winner} wins!`;
    winnerName.textContent = `Player ${winner}`;
    playWinHorn();
    launchFireworks();

    if (typeof winModal.showModal === "function" && !winModal.open) {
      winModal.showModal();
      modalNewRoundButton.focus();
      return;
    }

    restartButton.focus();
  }

  function closeWinModal() {
    clearFireworks();

    if (winModal.open) {
      winModal.close();
    }
  }

  function dismissWinModal() {
    closeWinModal();
    restartButton.focus();
  }

  function playWinHorn() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    audioContext ||= new AudioContext();
    audioContext.resume().catch(() => { });
    const start = audioContext.currentTime;
    const notes = [
      { frequency: 392, type: "sawtooth", hold: 0.08 },
      { frequency: 523.25, type: "triangle", hold: 0.07 },
      { frequency: 659.25, type: "square", hold: 0.08 },
      { frequency: 987.77, type: "triangle", hold: 0.12 },
      { frequency: 783.99, type: "square", hold: 0.24 }
    ];

    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteStart = start + index * 0.105;
      oscillator.type = note.type;
      oscillator.frequency.setValueAtTime(note.frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(HORN_VOLUME, noteStart + 0.015);
      gain.gain.setValueAtTime(HORN_VOLUME, noteStart + note.hold);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.hold + 0.16);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + note.hold + 0.18);
    });
  }

  function launchFireworks() {
    clearFireworks();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sparkCount = prefersReducedMotion ? REDUCED_MOTION_FIREWORK_COUNT : FIREWORK_COUNT;

    for (let index = 0; index < sparkCount; index += 1) {
      const spark = document.createElement("span");
      const burstIndex = index % 7;
      const angle = ((index % 12) * 30) + (Math.random() * 18 - 9);
      const x = 14 + ((burstIndex * 13) % 72) + Math.random() * 8;
      const y = 14 + ((burstIndex * 9) % 36) + Math.random() * 8;
      spark.classList.toggle("is-gentle", prefersReducedMotion);
      spark.style.setProperty("--firework-x", `${x}vw`);
      spark.style.setProperty("--firework-y", `${y}vh`);
      spark.style.setProperty("--firework-angle", `${angle}deg`);
      spark.style.setProperty(
        "--firework-distance",
        `${prefersReducedMotion ? 18 + Math.random() * 24 : 58 + Math.random() * 110}px`
      );
      spark.style.setProperty("--firework-delay", `${burstIndex * 0.12 + Math.random() * 0.08}s`);
      spark.style.setProperty("--firework-color", FIREWORK_COLORS[index % FIREWORK_COLORS.length]);
      fireworks.append(spark);
    }

    fireworksTimer = window.setTimeout(clearFireworks, 2200);
  }

  function clearFireworks() {
    window.clearTimeout(fireworksTimer);
    fireworks.replaceChildren();
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

  function handleModalClick(event) {
    if (event.target !== winModal) return;

    const rect = winModal.getBoundingClientRect();
    const isInsideModal =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInsideModal) {
      dismissWinModal();
    }
  }

  boardEl.addEventListener("click", handleCellClick);
  restartButton.addEventListener("click", restart);
  modalNewRoundButton.addEventListener("click", restart);
  winModal.addEventListener("click", handleModalClick);
  renderBoard();
  focusFrame = window.requestAnimationFrame(focusFirstOpenCell);

  return {
    cleanup() {
      window.cancelAnimationFrame(focusFrame);
      closeWinModal();
      boardEl.removeEventListener("click", handleCellClick);
      restartButton.removeEventListener("click", restart);
      modalNewRoundButton.removeEventListener("click", restart);
      winModal.removeEventListener("click", handleModalClick);
      audioContext?.close?.().catch(() => { });
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
