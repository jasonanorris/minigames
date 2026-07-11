const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const USED_ANSWERS_KEY = "minigames.wordle.usedAnswers";
const ANSWERS = [
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
const VALID_GUESSES = new Set([...ANSWERS, ...EXTRA_GUESSES].filter((word) => word.length === WORD_LENGTH));
const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export function startWordle({ stage }) {
  let answer = chooseAnswer();
  let currentGuess = "";
  let currentRow = 0;
  let isFinished = false;
  const keyStatuses = new Map();

  stage.innerHTML = `
    <div class="wordle-game" aria-live="polite">
      <div class="wordle-board" id="wordle-board" aria-label="Wordle board"></div>
      <p class="game-message wordle-message" id="wordle-message">Guess the 5-letter word.</p>
      <div class="wordle-keyboard" id="wordle-keyboard" aria-label="Wordle keyboard"></div>
      <button class="secondary-action wordle-restart" id="wordle-restart" type="button" hidden>New word</button>
    </div>
  `;

  const board = stage.querySelector("#wordle-board");
  const keyboard = stage.querySelector("#wordle-keyboard");
  const message = stage.querySelector("#wordle-message");
  const restartButton = stage.querySelector("#wordle-restart");

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
  }

  function renderKeyboard() {
    keyboard.innerHTML = "";

    KEY_ROWS.forEach((letters, rowIndex) => {
      const row = document.createElement("div");
      row.className = "wordle-key-row";

      if (rowIndex === KEY_ROWS.length - 1) {
        row.append(createKey("Enter", "ENTER", "wide"));
      }

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
    for (let columnIndex = 0; columnIndex < WORD_LENGTH; columnIndex += 1) {
      const tile = getTile(currentRow, columnIndex);
      tile.textContent = currentGuess[columnIndex] || "";
      tile.classList.toggle("is-filled", columnIndex < currentGuess.length);
    }
  }

  function submitGuess() {
    if (currentGuess.length < WORD_LENGTH) {
      setMessage("Need 5 letters.");
      shakeRow();
      return;
    }

    if (!VALID_GUESSES.has(currentGuess)) {
      setMessage("Not in the arcade dictionary.");
      shakeRow();
      return;
    }

    const result = scoreGuess(currentGuess, answer);

    result.forEach((status, columnIndex) => {
      const tile = getTile(currentRow, columnIndex);
      tile.classList.add(`is-${status}`);
      updateKeyStatus(currentGuess[columnIndex], status);
    });

    updateKeyboard();

    if (currentGuess === answer) {
      isFinished = true;
      setMessage(currentRow === 0 ? "Genius. First try!" : `Solved in ${currentRow + 1}.`);
      restartButton.hidden = false;
      restartButton.focus();
      return;
    }

    currentRow += 1;
    currentGuess = "";

    if (currentRow >= MAX_GUESSES) {
      isFinished = true;
      setMessage(`The word was ${answer}.`);
      restartButton.hidden = false;
      restartButton.focus();
      return;
    }

    setMessage(`${MAX_GUESSES - currentRow} guesses left.`);
  }

  function handleInput(value) {
    if (isFinished) {
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

  return {
    cleanup() {
      keyboard.removeEventListener("click", handleKeyboardClick);
      restartButton.removeEventListener("click", restart);
      window.removeEventListener("keydown", handlePhysicalKeyboard);
    }
  };
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
