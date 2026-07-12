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

export function startMines({ stage }) {
  let cells = [];
  let isFirstReveal = true;
  let isFinished = false;
  let isFlagMode = false;

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

  function newGame() {
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

    for (const cell of cells) {
      if (cell.isMine) {
        cell.isFlagged = true;
      }
    }

    messageEl.textContent = "You cleared the field!";
    render();
    newGameButton.focus();
  }

  function finishLoss() {
    isFinished = true;

    for (const cell of cells) {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    }

    messageEl.textContent = "Boom! Try another field.";
    render();
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

  boardEl.addEventListener("click", handleBoardClick);
  flagToggle.addEventListener("click", toggleFlagMode);
  newGameButton.addEventListener("click", newGame);
  newGame();

  return {
    cleanup() {
      boardEl.removeEventListener("click", handleBoardClick);
      flagToggle.removeEventListener("click", toggleFlagMode);
      newGameButton.removeEventListener("click", newGame);
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
