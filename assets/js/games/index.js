import { startTapRace } from "./tap-race.js";
import { startReactionTime } from "./reaction-time.js";
import { startMemoryGrid } from "./memory-grid.js";
import { startQuickMath } from "./quick-math.js";

export const games = [
  {
    id: "tap-race",
    title: "Tap Race",
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
    description: "Solve short arithmetic bursts against the clock.",
    status: "Playable",
    theme: {
      color: "#10232a",
      tint: "rgba(61, 214, 208, 0.18)",
      tintSecondary: "rgba(247, 201, 72, 0.1)"
    },
    start: startQuickMath
  }
];
