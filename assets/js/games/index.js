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
    start: startTapRace
  },
  {
    id: "reaction-time",
    title: "Reaction Time",
    description: "Wait for green, then tap as quickly as you can.",
    status: "Playable",
    start: startReactionTime
  },
  {
    id: "memory-grid",
    title: "Memory Grid",
    description: "Flip cards and match pairs with as few moves as possible.",
    status: "Playable",
    start: startMemoryGrid
  },
  {
    id: "quick-math",
    title: "Quick Math",
    description: "Solve short arithmetic bursts against the clock.",
    status: "Playable",
    start: startQuickMath
  }
];
