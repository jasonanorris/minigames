const SIZE = 8;
const MINE_COUNT = 10;
const CELL_COUNT = SIZE * SIZE;
const NEIGHBOR_OFFSETS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
];
const CELEBRATION_COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#4cc9f0", "#9b5de5", "#f78c6b"];
const BOMB_VOLUME = 0.44;
const HORN_VOLUME = 0.28;
const LONG_PRESS_MS = 520;

export function startMines({ stage }) {
  let cells = [];
  let isFirstReveal = true;
  let isFinished = false;
  let isFlagMode = false;
  let audioContext = null;
  let confettiTimer = null;
  let longPressTimer = null;
  let longPressIndex = null;
  let suppressClickIndex = null;
  let suppressClickTimer = null;

  stage.innerHTML = `
    <div class="mines-game">
      <div class="score-grid mines-stats">
        <div class="score-tile mines-stat">
          <span class="score-label">Mines</span>
          <strong id="mines-left">${MINE_COUNT}</strong>
        </div>
        <div class="score-tile mines-stat">
          <span class="score-label">Safe</span>
          <strong id="mines-safe">0 / ${CELL_COUNT - MINE_COUNT}</strong>
        </div>
      </div>

      <p class="game-message mines-message" id="mines-message">Find every safe tile. First tap is safe.</p>

      <div class="mines-board" id="mines-board" role="grid" aria-label="Mines board"></div>
      <div class="win-confetti mines-confetti" id="mines-confetti" aria-hidden="true"></div>

      <div class="mines-actions">
        <button class="secondary-action mines-flag-toggle" id="mines-flag-toggle" type="button" aria-pressed="false">🚩 Flag</button>
        <button class="secondary-action mines-new-game" id="mines-new-game" type="button">New game</button>
      </div>
    </div>
  `;

  const boardEl = stage.querySelector("#mines-board");
  const messageEl = stage.querySelector("#mines-message");
  const minesLeftEl = stage.querySelector("#mines-left");
  const safeEl = stage.querySelector("#mines-safe");
  const flagToggle = stage.querySelector("#mines-flag-toggle");
  const newGameButton = stage.querySelector("#mines-new-game");
  const confetti = stage.querySelector("#mines-confetti");

  function newGame() {
    clearConfetti();
    clearLongPress();
    clearSuppressedClick();
    cells = createEmptyCells();
    isFirstReveal = true;
    isFinished = false;
    isFlagMode = false;
    flagToggle.setAttribute("aria-pressed", "false");
    flagToggle.classList.remove("is-active");
    messageEl.textContent = "Find every safe tile. First tap is safe.";
    render();
    focusFirstHiddenCell();
  }

  function handleBoardClick(event) {
    const button = event.target.closest(".mines-cell");

    if (!button || isFinished) return;

    const index = Number.parseInt(button.dataset.index || "-1", 10);

    if (!Number.isInteger(index) || !cells[index] || cells[index].isRevealed) return;

    if (suppressClickIndex === index) {
      clearSuppressedClick();
      event.preventDefault();
      return;
    }

    if (isFlagMode) {
      toggleFlag(index);
      return;
    }

    revealCell(index);
  }

  function toggleFlag(index) {
    const cell = cells[index];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    messageEl.textContent = cell.isFlagged ? "Flag planted." : "Flag removed.";
    render();
    focusCell(index);
  }

  function revealCell(index) {
    const cell = cells[index];

    if (cell.isFlagged || cell.isRevealed) return;

    if (isFirstReveal) {
      plantMines(index);
      isFirstReveal = false;
    }

    if (cell.isMine) {
      cell.isRevealed = true;
      finishLoss();
      return;
    }

    revealSafeArea(index);
    const safeRevealed = getSafeRevealedCount();

    if (safeRevealed === CELL_COUNT - MINE_COUNT) {
      finishWin();
      return;
    }

    messageEl.textContent = cell.neighborMines
      ? `${cell.neighborMines} mine${cell.neighborMines === 1 ? "" : "s"} nearby.`
      : "Clear patch opened.";
    render();
    focusFirstHiddenCell();
  }

  function plantMines(safeIndex) {
    const blocked = new Set([safeIndex, ...getNeighbors(safeIndex)]);
    const candidates = cells
      .map((_, index) => index)
      .filter((index) => !blocked.has(index));

    shuffle(candidates);

    for (const index of candidates.slice(0, MINE_COUNT)) {
      cells[index].isMine = true;
    }

    for (const cell of cells) {
      if (!cell.isMine) {
        cell.neighborMines = getNeighbors(cell.index).filter((neighborIndex) => cells[neighborIndex].isMine).length;
      }
    }
  }

  function revealSafeArea(startIndex) {
    const queue = [startIndex];
    const visited = new Set();

    while (queue.length) {
      const index = queue.shift();
      const cell = cells[index];

      if (!cell || visited.has(index) || cell.isFlagged || cell.isRevealed) continue;

      visited.add(index);
      cell.isRevealed = true;

      if (cell.neighborMines === 0) {
        for (const neighborIndex of getNeighbors(index)) {
          const neighbor = cells[neighborIndex];

          if (!neighbor.isMine && !neighbor.isRevealed && !neighbor.isFlagged) {
            queue.push(neighborIndex);
          }
        }
      }
    }
  }

  function finishWin() {
    isFinished = true;
    clearLongPress();

    for (const cell of cells) {
      if (cell.isMine) {
        cell.isFlagged = true;
      }
    }

    messageEl.textContent = "You cleared the field!";
    render();
    playWinHorn();
    launchConfetti();
    newGameButton.focus();
  }

  function finishLoss() {
    isFinished = true;
    clearLongPress();

    for (const cell of cells) {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    }

    messageEl.textContent = "Boom! Try another field.";
    render();
    playBombSound();
    newGameButton.focus();
  }

  function render() {
    boardEl.innerHTML = "";
    const flaggedCount = cells.filter((cell) => cell.isFlagged).length;
    const safeRevealed = getSafeRevealedCount();
    minesLeftEl.textContent = String(Math.max(0, MINE_COUNT - flaggedCount));
    safeEl.textContent = `${safeRevealed} / ${CELL_COUNT - MINE_COUNT}`;

    for (const cell of cells) {
      const button = document.createElement("button");
      button.className = "mines-cell";
      button.type = "button";
      button.dataset.index = String(cell.index);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", getCellLabel(cell));
      button.disabled = isFinished || cell.isRevealed;

      if (cell.isRevealed) {
        button.classList.add("is-revealed");
      }

      if (cell.isFlagged && !cell.isRevealed) {
        button.classList.add("is-flagged");
        button.textContent = "⚑";
      } else if (cell.isRevealed && cell.isMine) {
        button.classList.add("is-mine");
        button.textContent = "✹";
      } else if (cell.isRevealed && cell.neighborMines) {
        button.classList.add(`near-${cell.neighborMines}`);
        button.textContent = String(cell.neighborMines);
      }

      boardEl.append(button);
    }
  }

  function getCellLabel(cell) {
    const row = Math.floor(cell.index / SIZE) + 1;
    const column = (cell.index % SIZE) + 1;

    if (cell.isFlagged && !cell.isRevealed) return `Flagged row ${row}, column ${column}`;
    if (!cell.isRevealed) return `Hidden row ${row}, column ${column}`;
    if (cell.isMine) return `Mine at row ${row}, column ${column}`;
    if (cell.neighborMines) return `${cell.neighborMines} nearby mines at row ${row}, column ${column}`;
    return `Clear row ${row}, column ${column}`;
  }

  function getSafeRevealedCount() {
    return cells.filter((cell) => cell.isRevealed && !cell.isMine).length;
  }

  function focusCell(index) {
    boardEl.querySelector(`[data-index="${index}"]`)?.focus();
  }

  function focusFirstHiddenCell() {
    boardEl.querySelector(".mines-cell:not(:disabled)")?.focus();
  }

  function toggleFlagMode() {
    isFlagMode = !isFlagMode;
    flagToggle.setAttribute("aria-pressed", String(isFlagMode));
    flagToggle.classList.toggle("is-active", isFlagMode);
    messageEl.textContent = isFlagMode ? "Flag mode on. Tap tiles to flag them." : "Reveal mode on.";
  }

  function handlePointerDown(event) {
    const button = event.target.closest(".mines-cell");

    if (!button || isFinished) return;

    const index = Number.parseInt(button.dataset.index || "-1", 10);

    if (!Number.isInteger(index) || !cells[index] || cells[index].isRevealed) return;

    clearLongPress();
    longPressIndex = index;
    button.classList.add("is-long-press");
    longPressTimer = window.setTimeout(() => {
      const activeIndex = longPressIndex;
      clearLongPress();

      if (Number.isInteger(activeIndex) && cells[activeIndex] && !cells[activeIndex].isRevealed && !isFinished) {
        suppressClickIndex = activeIndex;
        window.clearTimeout(suppressClickTimer);
        suppressClickTimer = window.setTimeout(clearSuppressedClick, 900);
        toggleFlag(activeIndex);
      }
    }, LONG_PRESS_MS);
  }

  function handlePointerEnd() {
    clearLongPress();
  }

  function handleContextMenu(event) {
    if (event.target.closest(".mines-cell")) {
      event.preventDefault();
    }
  }

  function clearLongPress() {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;

    if (Number.isInteger(longPressIndex)) {
      boardEl.querySelector(`[data-index="${longPressIndex}"]`)?.classList.remove("is-long-press");
    }

    longPressIndex = null;
  }

  function clearSuppressedClick() {
    window.clearTimeout(suppressClickTimer);
    suppressClickTimer = null;
    suppressClickIndex = null;
  }

  function playBombSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    audioContext ||= new AudioContext();
    audioContext.resume().catch(() => { });
    const now = audioContext.currentTime;
    const noiseLength = Math.floor(audioContext.sampleRate * 0.46);
    const noiseBuffer = audioContext.createBuffer(1, noiseLength, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let index = 0; index < noiseLength; index += 1) {
      const progress = index / noiseLength;
      noiseData[index] = (Math.random() * 2 - 1) * (1 - progress) ** 1.8;
    }

    const noise = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const noiseFilter = audioContext.createBiquadFilter();
    const crack = audioContext.createOscillator();
    const crackGain = audioContext.createGain();
    const boom = audioContext.createOscillator();
    const boomGain = audioContext.createGain();
    noise.buffer = noiseBuffer;
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(820, now);
    noiseFilter.Q.setValueAtTime(0.9, now);
    noiseGain.gain.setValueAtTime(BOMB_VOLUME * 1.05, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);

    crack.type = "square";
    crack.frequency.setValueAtTime(360, now);
    crack.frequency.exponentialRampToValueAtTime(95, now + 0.16);
    crackGain.gain.setValueAtTime(0.0001, now);
    crackGain.gain.exponentialRampToValueAtTime(BOMB_VOLUME * 0.86, now + 0.012);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    boom.type = "triangle";
    boom.frequency.setValueAtTime(220, now + 0.02);
    boom.frequency.exponentialRampToValueAtTime(70, now + 0.42);
    boomGain.gain.setValueAtTime(0.0001, now);
    boomGain.gain.exponentialRampToValueAtTime(BOMB_VOLUME * 0.72, now + 0.03);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    noise.connect(noiseFilter).connect(noiseGain).connect(audioContext.destination);
    crack.connect(crackGain).connect(audioContext.destination);
    boom.connect(boomGain).connect(audioContext.destination);
    noise.start(now);
    noise.stop(now + 0.48);
    crack.start(now);
    crack.stop(now + 0.2);
    boom.start(now + 0.02);
    boom.stop(now + 0.5);
  }

  function playWinHorn() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    audioContext ||= new AudioContext();
    audioContext.resume().catch(() => { });
    const start = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteStart = start + index * 0.12;
      oscillator.type = index === notes.length - 1 ? "square" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(HORN_VOLUME, noteStart + 0.018);
      gain.gain.setValueAtTime(HORN_VOLUME, noteStart + (index === notes.length - 1 ? 0.11 : 0.05));
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + (index === notes.length - 1 ? 0.42 : 0.16));
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + (index === notes.length - 1 ? 0.44 : 0.18));
    });
  }

  function launchConfetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    clearConfetti();

    for (let index = 0; index < 72; index += 1) {
      const piece = document.createElement("span");
      piece.style.setProperty("--confetti-x", `${Math.random() * 100}vw`);
      piece.style.setProperty("--confetti-drift", `${Math.random() * 180 - 90}px`);
      piece.style.setProperty("--confetti-delay", `${Math.random() * 0.45}s`);
      piece.style.setProperty("--confetti-duration", `${1.8 + Math.random() * 1.5}s`);
      piece.style.setProperty("--confetti-spin", `${360 + Math.random() * 900}deg`);
      piece.style.setProperty("--confetti-color", CELEBRATION_COLORS[index % CELEBRATION_COLORS.length]);
      confetti.append(piece);
    }

    confettiTimer = window.setTimeout(clearConfetti, 3800);
  }

  function clearConfetti() {
    window.clearTimeout(confettiTimer);
    confetti.replaceChildren();
  }

  boardEl.addEventListener("click", handleBoardClick);
  boardEl.addEventListener("pointerdown", handlePointerDown);
  boardEl.addEventListener("pointerup", handlePointerEnd);
  boardEl.addEventListener("pointerleave", handlePointerEnd);
  boardEl.addEventListener("pointercancel", handlePointerEnd);
  boardEl.addEventListener("contextmenu", handleContextMenu);
  flagToggle.addEventListener("click", toggleFlagMode);
  newGameButton.addEventListener("click", newGame);
  newGame();

  return {
    cleanup() {
      clearConfetti();
      clearLongPress();
      clearSuppressedClick();
      boardEl.removeEventListener("click", handleBoardClick);
      boardEl.removeEventListener("pointerdown", handlePointerDown);
      boardEl.removeEventListener("pointerup", handlePointerEnd);
      boardEl.removeEventListener("pointerleave", handlePointerEnd);
      boardEl.removeEventListener("pointercancel", handlePointerEnd);
      boardEl.removeEventListener("contextmenu", handleContextMenu);
      flagToggle.removeEventListener("click", toggleFlagMode);
      newGameButton.removeEventListener("click", newGame);
      audioContext?.close?.().catch(() => { });
    }
  };
}

function createEmptyCells() {
  return Array.from({ length: CELL_COUNT }, (_, index) => ({
    index,
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    neighborMines: 0
  }));
}

function getNeighbors(index) {
  const row = Math.floor(index / SIZE);
  const column = index % SIZE;
  const neighbors = [];

  for (const [rowOffset, columnOffset] of NEIGHBOR_OFFSETS) {
    const nextRow = row + rowOffset;
    const nextColumn = column + columnOffset;

    if (nextRow >= 0 && nextRow < SIZE && nextColumn >= 0 && nextColumn < SIZE) {
      neighbors.push(nextRow * SIZE + nextColumn);
    }
  }

  return neighbors;
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}
