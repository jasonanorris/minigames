const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const USED_ANSWERS_KEY = "minigames.wordle.usedAnswers";
const CURRENT_STREAK_KEY = "minigames.wordle.currentStreak";
const BEST_STREAK_KEY = "minigames.wordle.bestStreak";
const WORD_LIST_URL = "assets/data/wordle-words.csv";
const CELEBRATION_COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f78c6b", "#4cc9f0", "#90be6d"];
const HORN_VOLUME = 0.28;
let wordListPromise = null;
let ANSWERS = [
  "ABOUT",
  "ABOVE",
  "ABUSE",
  "ACORN",
  "ACRID",
  "ACTOR",
  "ADAPT",
  "ADMIT",
  "ADORE",
  "ADULT",
  "AFTER",
  "AGAIN",
  "AGENT",
  "AGILE",
  "ALARM",
  "ALBUM",
  "ALERT",
  "ALIEN",
  "ALIVE",
  "ALLOW",
  "ALONE",
  "AMBER",
  "AMONG",
  "ANGLE",
  "ANGRY",
  "APPLE",
  "APRON",
  "ARENA",
  "ARGUE",
  "ARISE",
  "ARROW",
  "ASIDE",
  "AUDIO",
  "AWAKE",
  "BACON",
  "BADGE",
  "BASIC",
  "BASIL",
  "BATCH",
  "BEACH",
  "BEARD",
  "BEAST",
  "BEGIN",
  "BERRY",
  "BIRTH",
  "BLACK",
  "BLAST",
  "BLEND",
  "BLINK",
  "BLOCK",
  "BLOOM",
  "BOARD",
  "BRAIN",
  "BRAVE",
  "BREAD",
  "BRICK",
  "BRIDE",
  "BROWN",
  "BRUSH",
  "BUNCH",
  "CABIN",
  "CABLE",
  "CANDY",
  "CARRY",
  "CATCH",
  "CAUSE",
  "CHAIN",
  "CHAIR",
  "CHARM",
  "CHASE",
  "CHESS",
  "CHILD",
  "CHILL",
  "CIVIC",
  "CLAIM",
  "CLASH",
  "CLASS",
  "CLEAN",
  "CLEAR",
  "CLIMB",
  "CLOCK",
  "CLOUD",
  "COAST",
  "COMET",
  "CORAL",
  "COUNT",
  "COURT",
  "CRANE",
  "CRISP",
  "CROWN",
  "CURVE",
  "DAILY",
  "DANCE",
  "DEALT",
  "DELTA",
  "DICEY",
  "DODGE",
  "DREAM",
  "DRIFT",
  "DRIVE",
  "EARLY",
  "EARTH",
  "EAGLE",
  "ELBOW",
  "ELDER",
  "ELITE",
  "EMPTY",
  "ENJOY",
  "ENTER",
  "EQUAL",
  "EVENT",
  "EVERY",
  "EXTRA",
  "FAIRY",
  "FAITH",
  "FALSE",
  "FANCY",
  "FAULT",
  "FEAST",
  "FIELD",
  "FINAL",
  "FIRST",
  "FLASH",
  "FLAME",
  "FLOOR",
  "FOCUS",
  "FORCE",
  "FORGE",
  "FRAME",
  "FRESH",
  "FROST",
  "FRUIT",
  "GIANT",
  "GLASS",
  "GLOBE",
  "GLORY",
  "GHOST",
  "GRACE",
  "GRADE",
  "GRAPE",
  "GRAPH",
  "GRASS",
  "GREAT",
  "GREEN",
  "GROUP",
  "GUARD",
  "HAPPY",
  "HEART",
  "HONEY",
  "HORSE",
  "HOUSE",
  "HUMAN",
  "HUMOR",
  "IGLOO",
  "IMAGE",
  "INDEX",
  "INPUT",
  "IVORY",
  "JELLY",
  "JOINT",
  "JOKER",
  "JUDGE",
  "JUICE",
  "KARMA",
  "KAYAK",
  "KIOSK",
  "KNIFE",
  "LABEL",
  "LARGE",
  "LASER",
  "LAUGH",
  "LAYER",
  "LEARN",
  "LEMON",
  "LEVEL",
  "LIGHT",
  "LOCAL",
  "LODGE",
  "LOGIC",
  "LUCKY",
  "MAGIC",
  "MAJOR",
  "MANGO",
  "MAPLE",
  "MARCH",
  "MATCH",
  "MEDAL",
  "MERCY",
  "METAL",
  "MIGHT",
  "MINOR",
  "MODEL",
  "MONEY",
  "MOUSE",
  "MUSIC",
  "NERVE",
  "NIGHT",
  "NINJA",
  "NOBLE",
  "NOISE",
  "NORTH",
  "NOVEL",
  "OCEAN",
  "OLIVE",
  "ONION",
  "OPERA",
  "ORBIT",
  "ORDER",
  "OTHER",
  "PAINT",
  "PANEL",
  "PARTY",
  "PASTA",
  "PATCH",
  "PEACH",
  "PEARL",
  "PHASE",
  "PIANO",
  "PIXEL",
  "PLANT",
  "PLATE",
  "PLUCK",
  "POINT",
  "POUND",
  "POWER",
  "PRESS",
  "PRIDE",
  "PRIME",
  "PRINT",
  "PRIZE",
  "PROUD",
  "QUEST",
  "QUICK",
  "QUIET",
  "RADIO",
  "RANCH",
  "RANGE",
  "RATIO",
  "REACT",
  "READY",
  "REALM",
  "REBEL",
  "RIVER",
  "ROBOT",
  "ROUND",
  "ROYAL",
  "SAUCE",
  "SCALE",
  "SCENE",
  "SCORE",
  "SCOUT",
  "SHARE",
  "SHELF",
  "SHINE",
  "SHORE",
  "SKILL",
  "SLEEP",
  "SLICE",
  "SMILE",
  "SNAKE",
  "SOLAR",
  "SOLID",
  "SOUND",
  "SPACE",
  "SPARK",
  "SPEED",
  "SPICE",
  "SPIKE",
  "SPINE",
  "SPORT",
  "STACK",
  "STAGE",
  "STAIR",
  "START",
  "STEAM",
  "STONE",
  "STORM",
  "STORY",
  "STYLE",
  "SUGAR",
  "SUPER",
  "SWEET",
  "TABLE",
  "TEACH",
  "TENSE",
  "THEME",
  "THING",
  "THORN",
  "TIGER",
  "TOAST",
  "TOKEN",
  "TRACE",
  "TRACK",
  "TRAIN",
  "TRICK",
  "TRUST",
  "ULTRA",
  "UNION",
  "UNITY",
  "UPPER",
  "URBAN",
  "VALUE",
  "VIDEO",
  "VIVID",
  "VOICE",
  "WATER",
  "WHEEL",
  "WHITE",
  "WHOLE",
  "WOMAN",
  "WORLD",
  "WORRY",
  "YEAST",
  "YOUNG",
  "YOUTH",
  "ZEBRA",
  "ZESTY",
  "ZONED"
];
const EXTRA_GUESSES = [
  "XENON",
  "ZIPPY"
];
let VALID_GUESSES = new Set([...ANSWERS, ...EXTRA_GUESSES].filter((word) => word.length === WORD_LENGTH));
const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export function startWordle({ stage }) {
  let answer = "";
  let currentGuess = "";
  let currentRow = 0;
  let isFinished = false;
  let isMounted = true;
  let isReady = false;
  let audioContext = null;
  let confettiTimer = null;
  const keyStatuses = new Map();

  stage.innerHTML = `
    <div class="wordle-game" aria-live="polite">
      <div class="win-confetti wordle-confetti" id="wordle-confetti" aria-hidden="true"></div>
      <div class="wordle-stats" aria-label="Wordle stats">
        <div class="score-tile wordle-stat">
          <span class="score-label">Streak</span>
          <strong id="wordle-streak">${readNumber(CURRENT_STREAK_KEY)}</strong>
        </div>
        <div class="score-tile wordle-stat">
          <span class="score-label">Best</span>
          <strong id="wordle-best-streak">${readNumber(BEST_STREAK_KEY)}</strong>
        </div>
      </div>
      <div class="wordle-board" id="wordle-board" aria-label="Wordle board"></div>
      <p class="game-message wordle-message" id="wordle-message">Loading word list...</p>
      <div class="wordle-keyboard" id="wordle-keyboard" aria-label="Wordle keyboard"></div>
      <button class="secondary-action wordle-restart" id="wordle-restart" type="button" hidden>New word</button>
    </div>
  `;

  const board = stage.querySelector("#wordle-board");
  const keyboard = stage.querySelector("#wordle-keyboard");
  const message = stage.querySelector("#wordle-message");
  const restartButton = stage.querySelector("#wordle-restart");
  const streakEl = stage.querySelector("#wordle-streak");
  const bestStreakEl = stage.querySelector("#wordle-best-streak");
  const confetti = stage.querySelector("#wordle-confetti");

  function renderBoard() {
    board.innerHTML = "";

    for (let rowIndex = 0; rowIndex < MAX_GUESSES; rowIndex += 1) {
      const row = document.createElement("div");
      row.className = "wordle-row";

      for (let columnIndex = 0; columnIndex < WORD_LENGTH; columnIndex += 1) {
        const tile = document.createElement("span");
        tile.className = "wordle-tile";
        tile.dataset.row = String(rowIndex);
        tile.dataset.column = String(columnIndex);
        row.append(tile);
      }

      board.append(row);
    }

    updateCurrentTiles();
  }

  function renderKeyboard() {
    keyboard.innerHTML = "";

    KEY_ROWS.forEach((letters, rowIndex) => {
      const row = document.createElement("div");
      row.className = "wordle-key-row";

      for (const letter of letters) {
        row.append(createKey(letter, letter));
      }

      if (rowIndex === KEY_ROWS.length - 1) {
        row.append(createKey("⌫", "BACKSPACE", "wide"));
      }

      keyboard.append(row);
    });
  }

  function createKey(label, value, size = "") {
    const key = document.createElement("button");
    key.className = `wordle-key ${size ? `is-${size}` : ""}`.trim();
    key.type = "button";
    key.dataset.key = value;
    key.textContent = label;
    return key;
  }

  function updateCurrentTiles() {
    clearActiveTiles();

    for (let columnIndex = 0; columnIndex < WORD_LENGTH; columnIndex += 1) {
      const tile = getTile(currentRow, columnIndex);
      tile.textContent = currentGuess[columnIndex] || "";
      tile.classList.toggle("is-filled", columnIndex < currentGuess.length);
    }

    if (isFinished) {
      return;
    }

    const activeColumn = Math.min(currentGuess.length, WORD_LENGTH - 1);
    getTile(currentRow, activeColumn)?.classList.add("is-active");
  }

  function submitGuess() {
    if (!isReady) {
      setMessage("Loading word list...");
      return;
    }

    if (currentGuess.length < WORD_LENGTH) {
      setMessage("Need 5 letters.");
      shakeRow();
      return;
    }

    if (!VALID_GUESSES.has(currentGuess)) {
      setMessage("Not in the arcade dictionary.");
      updateCurrentTiles();
      shakeRow();
      return;
    }

    clearActiveTiles();
    const result = scoreGuess(currentGuess, answer);

    result.forEach((status, columnIndex) => {
      const tile = getTile(currentRow, columnIndex);
      tile.classList.add(`is-${status}`);
      updateKeyStatus(currentGuess[columnIndex], status);
    });

    updateKeyboard();

    if (currentGuess === answer) {
      isFinished = true;
      recordWin();
      celebrateWin();
      setMessage(currentRow === 0 ? "Genius. First try!" : `Solved in ${currentRow + 1}.`);
      restartButton.hidden = false;
      restartButton.focus();
      return;
    }

    currentRow += 1;
    currentGuess = "";

    if (currentRow >= MAX_GUESSES) {
      isFinished = true;
      recordLoss();
      setMessage(`The word was ${answer}.`);
      restartButton.hidden = false;
      restartButton.focus();
      return;
    }

    setMessage(`${MAX_GUESSES - currentRow} guesses left.`);
  }

  function handleInput(value) {
    if (isFinished || !isReady) {
      return;
    }

    if (value === "ENTER") {
      submitGuess();
      return;
    }

    if (value === "BACKSPACE") {
      currentGuess = currentGuess.slice(0, -1);
      updateCurrentTiles();
      return;
    }

    if (/^[A-Z]$/.test(value) && currentGuess.length < WORD_LENGTH) {
      currentGuess += value;
      updateCurrentTiles();

      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      }
    }
  }

  function handleKeyboardClick(event) {
    const key = event.target.closest(".wordle-key");

    if (!key) {
      return;
    }

    handleInput(key.dataset.key);
  }

  function handlePhysicalKeyboard(event) {
    if (!stage.contains(document.activeElement) && document.activeElement !== document.body) {
      return;
    }

    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key.toUpperCase();

    if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
      event.preventDefault();
      handleInput(key);
    }
  }

  function restart() {
    clearConfetti();
    answer = chooseAnswer();
    currentGuess = "";
    currentRow = 0;
    isFinished = false;
    keyStatuses.clear();
    restartButton.hidden = true;
    setMessage("Guess the 5-letter word.");
    renderBoard();
    updateKeyboard();
    stage.focus();
  }

  function celebrateWin() {
    playWinHorn();
    launchConfetti();
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
      gain.gain.setValueAtTime(
        HORN_VOLUME,
        noteStart + (index === notes.length - 1 ? 0.11 : 0.05)
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + (index === notes.length - 1 ? 0.42 : 0.16)
      );
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + (index === notes.length - 1 ? 0.44 : 0.18));
    });
  }

  function launchConfetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    window.clearTimeout(confettiTimer);
    confetti.replaceChildren();

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

  function clearActiveTiles() {
    for (const tile of board.querySelectorAll(".wordle-tile.is-active")) {
      tile.classList.remove("is-active");
    }
  }

  function updateKeyboard() {
    for (const key of keyboard.querySelectorAll(".wordle-key")) {
      const status = keyStatuses.get(key.dataset.key);
      key.classList.remove("is-correct", "is-present", "is-absent");

      if (status) {
        key.classList.add(`is-${status}`);
      }
    }
  }

  function updateKeyStatus(letter, status) {
    const currentStatus = keyStatuses.get(letter);

    if (getStatusRank(status) > getStatusRank(currentStatus)) {
      keyStatuses.set(letter, status);
    }
  }

  function recordWin() {
    const nextStreak = readNumber(CURRENT_STREAK_KEY) + 1;
    const nextBestStreak = Math.max(readNumber(BEST_STREAK_KEY), nextStreak);
    writeNumber(CURRENT_STREAK_KEY, nextStreak);
    writeNumber(BEST_STREAK_KEY, nextBestStreak);
    renderStreaks(nextStreak, nextBestStreak);
  }

  function recordLoss() {
    writeNumber(CURRENT_STREAK_KEY, 0);
    renderStreaks(0, readNumber(BEST_STREAK_KEY));
  }

  function renderStreaks(currentStreak, bestStreak) {
    streakEl.textContent = String(currentStreak);
    bestStreakEl.textContent = String(bestStreak);
  }

  function getTile(rowIndex, columnIndex) {
    return board.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex}"]`);
  }

  function setMessage(text) {
    message.textContent = text;
  }

  function shakeRow() {
    const row = board.children[currentRow];
    row.classList.remove("is-shaking");
    window.requestAnimationFrame(() => row.classList.add("is-shaking"));
  }

  renderBoard();
  renderKeyboard();
  keyboard.addEventListener("click", handleKeyboardClick);
  restartButton.addEventListener("click", restart);
  window.addEventListener("keydown", handlePhysicalKeyboard);
  initializeWordle();

  return {
    cleanup() {
      isMounted = false;
      clearConfetti();
      audioContext?.close().catch(() => { });
      keyboard.removeEventListener("click", handleKeyboardClick);
      restartButton.removeEventListener("click", restart);
      window.removeEventListener("keydown", handlePhysicalKeyboard);
    }
  };

  async function initializeWordle() {
    await loadWordList();

    if (!isMounted) {
      return;
    }

    answer = chooseAnswer();
    isReady = true;
    setMessage("Guess the 5-letter word.");
  }
}

async function loadWordList() {
  wordListPromise ||= fetch(WORD_LIST_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load Wordle word list: ${response.status}`);
      }

      return response.text();
    })
    .then((csvText) => {
      const csvWords = parseWordListCsv(csvText);

      if (csvWords.length === 0) {
        return;
      }

      ANSWERS = csvWords;
      VALID_GUESSES = new Set(csvWords);
    })
    .catch(() => {
      // The bundled list above keeps the game playable if the CSV cannot load.
    });

  return wordListPromise;
}

function parseWordListCsv(csvText) {
  const words = [];
  const seenWords = new Set();

  csvText.split(/\r?\n/).forEach((line, index) => {
    const [firstCell] = line.split(",");
    const word = firstCell?.trim().replace(/^"|"$/g, "").toUpperCase();

    if (
      index === 0 &&
      (word === "WORD" || word === "WORDS" || word === "ANSWER" || word === "ANSWERS")
    ) {
      return;
    }

    if (!/^[A-Z]{5}$/.test(word) || seenWords.has(word)) {
      return;
    }

    seenWords.add(word);
    words.push(word);
  });

  return words;
}

function chooseAnswer() {
  const usedAnswers = readUsedAnswers();
  let availableAnswers = ANSWERS.filter((word) => !usedAnswers.has(word));

  if (availableAnswers.length === 0) {
    usedAnswers.clear();
    availableAnswers = [...ANSWERS];
  }

  const answer = availableAnswers[Math.floor(Math.random() * availableAnswers.length)];
  usedAnswers.add(answer);
  writeUsedAnswers(usedAnswers);
  return answer;
}

function readUsedAnswers() {
  try {
    const storedValue = window.localStorage.getItem(USED_ANSWERS_KEY);
    const parsedValue = JSON.parse(storedValue || "[]");

    if (!Array.isArray(parsedValue)) {
      return new Set();
    }

    return new Set(parsedValue.filter((word) => ANSWERS.includes(word)));
  } catch {
    return new Set();
  }
}

function writeUsedAnswers(usedAnswers) {
  try {
    window.localStorage.setItem(USED_ANSWERS_KEY, JSON.stringify([...usedAnswers]));
  } catch {
    // Some browser privacy modes disable local storage. The game still works.
  }
}

function readNumber(key) {
  try {
    const value = Number.parseInt(window.localStorage.getItem(key) || "0", 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeNumber(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Some browser privacy modes disable local storage. The game still works.
  }
}

function scoreGuess(guess, answer) {
  const result = Array.from({ length: WORD_LENGTH }, () => "absent");
  const remainingLetters = new Map();

  for (let index = 0; index < WORD_LENGTH; index += 1) {
    if (guess[index] === answer[index]) {
      result[index] = "correct";
      continue;
    }

    remainingLetters.set(answer[index], (remainingLetters.get(answer[index]) || 0) + 1);
  }

  for (let index = 0; index < WORD_LENGTH; index += 1) {
    if (result[index] === "correct") {
      continue;
    }

    const count = remainingLetters.get(guess[index]) || 0;

    if (count > 0) {
      result[index] = "present";
      remainingLetters.set(guess[index], count - 1);
    }
  }

  return result;
}

function getStatusRank(status) {
  return status === "correct" ? 3 : status === "present" ? 2 : status === "absent" ? 1 : 0;
}
