const BEST_MOVES_KEY = "minigames.memoryGrid.bestMoves";
const PAIRS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const MISMATCH_DELAY_MS = 700;

export function startMemoryGrid({ stage }) {
  let deck = [];
  let firstCard = null;
  let matchedPairs = 0;
  let moves = 0;
  let isLocked = false;
  let mismatchTimerId = null;

  stage.innerHTML = `
    <div class="memory-game" aria-live="polite">
      <div class="score-grid memory-score-grid">
        <div class="score-tile">
          <span class="score-label">Moves</span>
          <strong id="memory-moves">0</strong>
        </div>
        <div class="score-tile">
          <span class="score-label">Pairs</span>
          <strong id="memory-pairs">0 / ${PAIRS.length}</strong>
        </div>
        <div class="score-tile">
          <span class="score-label">Best</span>
          <strong id="memory-best">${formatBest(readBestMoves())}</strong>
        </div>
      </div>

      <div class="memory-grid" id="memory-grid" aria-label="Memory cards"></div>
      <p class="game-message" id="memory-message">Find all eight matching pairs.</p>
      <button class="secondary-action" id="memory-restart" type="button">New game</button>
    </div>
  `;

  const gridEl = stage.querySelector("#memory-grid");
  const movesEl = stage.querySelector("#memory-moves");
  const pairsEl = stage.querySelector("#memory-pairs");
  const bestEl = stage.querySelector("#memory-best");
  const messageEl = stage.querySelector("#memory-message");
  const restartButton = stage.querySelector("#memory-restart");

  function startNewGame() {
    window.clearTimeout(mismatchTimerId);
    mismatchTimerId = null;
    deck = shuffle([...PAIRS, ...PAIRS]).map((pair, index) => ({
      id: index,
      pair,
      isMatched: false,
      isRevealed: false
    }));
    firstCard = null;
    matchedPairs = 0;
    moves = 0;
    isLocked = false;
    movesEl.textContent = "0";
    pairsEl.textContent = `0 / ${PAIRS.length}`;
    bestEl.textContent = formatBest(readBestMoves());
    messageEl.textContent = "Find all eight matching pairs.";
    renderDeck();
    gridEl.querySelector(".memory-card")?.focus();
  }

  function renderDeck() {
    gridEl.innerHTML = "";

    for (const card of deck) {
      const button = document.createElement("button");
      const isVisible = card.isRevealed || card.isMatched;
      button.className = "memory-card";
      button.type = "button";
      button.dataset.cardId = String(card.id);
      button.dataset.pair = card.pair;
      button.setAttribute("aria-label", isVisible ? `Card ${card.pair}` : "Hidden card");

      if (isVisible) {
        button.classList.add("is-revealed", `pair-${card.pair.toLowerCase()}`);
        button.textContent = card.pair;
      }

      if (card.isMatched) {
        button.classList.add("is-matched");
        button.disabled = true;
        button.setAttribute("aria-label", `Matched card ${card.pair}`);
      }

      gridEl.append(button);
    }
  }

  function handleCardClick(event) {
    const button = event.target.closest(".memory-card");

    if (!button || isLocked) {
      return;
    }

    const card = deck.find((item) => item.id === Number(button.dataset.cardId));

    if (!card || card.isMatched || card.isRevealed) {
      return;
    }

    card.isRevealed = true;
    renderDeck();

    if (firstCard === null) {
      firstCard = card;
      messageEl.textContent = "Choose its match.";
      return;
    }

    moves += 1;
    movesEl.textContent = String(moves);

    if (firstCard.pair === card.pair) {
      firstCard.isMatched = true;
      card.isMatched = true;
      firstCard = null;
      matchedPairs += 1;
      pairsEl.textContent = `${matchedPairs} / ${PAIRS.length}`;
      messageEl.textContent = "Match.";
      renderDeck();

      if (matchedPairs === PAIRS.length) {
        finishGame();
      }
      return;
    }

    isLocked = true;
    messageEl.textContent = "No match.";
    const missedCard = firstCard;
    firstCard = null;
    mismatchTimerId = window.setTimeout(() => {
      missedCard.isRevealed = false;
      card.isRevealed = false;
      mismatchTimerId = null;
      isLocked = false;
      messageEl.textContent = "Try another pair.";
      renderDeck();
    }, MISMATCH_DELAY_MS);
  }

  function finishGame() {
    const currentBest = readBestMoves();

    if (currentBest === null || moves < currentBest) {
      writeBestMoves(moves);
      bestEl.textContent = String(moves);
      messageEl.textContent = `New best: ${moves} moves.`;
      return;
    }

    messageEl.textContent = `Board cleared in ${moves} moves.`;
  }

  gridEl.addEventListener("click", handleCardClick);
  restartButton.addEventListener("click", startNewGame);
  startNewGame();

  return () => {
    window.clearTimeout(mismatchTimerId);
    gridEl.removeEventListener("click", handleCardClick);
    restartButton.removeEventListener("click", startNewGame);
  };
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

function formatBest(moves) {
  return moves === null ? "--" : String(moves);
}

function readBestMoves() {
  try {
    const storedMoves = window.localStorage.getItem(BEST_MOVES_KEY);

    if (storedMoves === null) {
      return null;
    }

    const moves = Number.parseInt(storedMoves, 10);
    return Number.isFinite(moves) && moves > 0 ? moves : null;
  } catch {
    return null;
  }
}

function writeBestMoves(moves) {
  try {
    window.localStorage.setItem(BEST_MOVES_KEY, String(moves));
  } catch {
    // Some browser privacy modes disable local storage. The game still works.
  }
}
