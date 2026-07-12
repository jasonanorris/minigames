import { startTapRace } from "./tap-race.js";
import { startReactionTime } from "./reaction-time.js";
import { startMemoryGrid } from "./memory-grid.js";
import { startQuickMath } from "./quick-math.js";
import { startTheWheel } from "./the-wheel.js";
import { startSnake } from "./snake.js";
import { startWordle } from "./wordle.js";
import { startTicTacToe } from "./tic-tac-toe.js";
import { startMines } from "./mines.js";

const placeholderGames = [
  { id: "simon", title: "Simon", mark: "1234" },
  { id: "word-mix", title: "Word Mix", mark: "ABC" },
  { id: "number-merge", title: "2048", mark: "2048" },
  { id: "color-match", title: "Color Match", mark: "RGB" },
  { id: "maze", title: "Maze", mark: "->" },
  { id: "breakout", title: "Breakout", mark: "|||" },
  { id: "dice-roll", title: "Dice Roll", mark: "D6" }
].map((game) => ({
  ...game,
  description: "Coming soon.",
  status: "Coming soon",
  start: null
}));

export const games = [
  {
    id: "tap-race",
    title: "Tap Race",
    mark: "10s",
    displayMode: "small",
    description: "Tap as fast as you can before time runs out.",
    status: "Playable",
    theme: {
      color: "#242014",
      tint: "rgba(247, 201, 72, 0.2)",
      tintSecondary: "rgba(240, 168, 48, 0.12)"
    },
    start: startTapRace
  },
  {
    id: "reaction-time",
    title: "Reaction Time",
    mark: "ms",
    displayMode: "small",
    description: "Wait for green, then tap as quickly as you can.",
    status: "Playable",
    theme: {
      color: "#10251f",
      tint: "rgba(22, 132, 91, 0.22)",
      tintSecondary: "rgba(61, 214, 208, 0.12)"
    },
    start: startReactionTime
  },
  {
    id: "memory-grid",
    title: "Memory Grid",
    mark: "2x",
    displayMode: "full",
    description: "Flip cards and match pairs with as few moves as possible.",
    status: "Playable",
    theme: {
      color: "#181c2a",
      tint: "rgba(139, 90, 172, 0.2)",
      tintSecondary: "rgba(60, 104, 168, 0.14)"
    },
    start: startMemoryGrid
  },
  {
    id: "quick-math",
    title: "Quick Math",
    mark: "1+1",
    displayMode: "small",
    description: "Solve short arithmetic bursts against the clock.",
    status: "Playable",
    theme: {
      color: "#10232a",
      tint: "rgba(61, 214, 208, 0.18)",
      tintSecondary: "rgba(247, 201, 72, 0.1)"
    },
    start: startQuickMath
  },
  {
    id: "the-wheel",
    title: "The Wheel",
    mark: "★",
    displayMode: "small",
    description: "Fill the wheel with prizes and give it a spin.",
    status: "Playable",
    theme: { color: "#24142d", tint: "rgba(239, 71, 111, 0.2)", tintSecondary: "rgba(255, 209, 102, 0.14)" },
    start: startTheWheel
  },
  {
    id: "snake",
    title: "Snake",
    mark: "S",
    displayMode: "full",
    description: "Eat snacks, grow longer, and avoid the walls.",
    status: "Playable",
    theme: {
      color: "#10251a",
      tint: "rgba(144, 190, 109, 0.2)",
      tintSecondary: "rgba(6, 214, 160, 0.12)"
    },
    start: startSnake
  },
  {
    id: "wordle",
    title: "Wordle",
    mark: "WORD",
    displayMode: "medium",
    description: "Guess the hidden five-letter word in six tries.",
    status: "Playable",
    theme: {
      color: "#17202a",
      tint: "rgba(144, 190, 109, 0.2)",
      tintSecondary: "rgba(247, 201, 72, 0.12)"
    },
    start: startWordle
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    mark: "XO",
    displayMode: "small",
    description: "Take turns placing Xs and Os until someone claims three in a row.",
    status: "Playable",
    theme: {
      color: "#20172a",
      tint: "rgba(155, 93, 229, 0.2)",
      tintSecondary: "rgba(6, 214, 160, 0.12)"
    },
    start: startTicTacToe
  },
  {
    id: "mines",
    title: "Mines",
    mark: "💣",
    displayMode: "medium",
    description: "Reveal safe tiles, flag mines, and clear the field.",
    status: "Playable",
    theme: {
      color: "#17241f",
      tint: "rgba(6, 214, 160, 0.18)",
      tintSecondary: "rgba(255, 209, 102, 0.12)"
    },
    start: startMines
  },
  ...placeholderGames
];
