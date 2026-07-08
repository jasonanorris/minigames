import { startTapRace } from "./tap-race.js";
import { startReactionTime } from "./reaction-time.js";

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
    id: "quick-math",
    title: "Quick Math",
    description: "Solve short arithmetic bursts against the clock.",
    status: "Idea",
    start: startComingSoonGame
  }
];

function startComingSoonGame({ game, stage, resetStage }) {
  const wrapper = document.createElement("div");
  wrapper.className = "coming-soon";

  const heading = document.createElement("div");
  const eyebrow = document.createElement("p");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const note = document.createElement("p");
  const backButton = document.createElement("button");

  eyebrow.className = "eyebrow";
  eyebrow.textContent = game.status;
  title.textContent = game.title;
  description.textContent = game.description;
  note.textContent = "This play area is wired up. The actual game logic lands in a later phase.";
  backButton.className = "primary-action";
  backButton.type = "button";
  backButton.textContent = "Back to games";

  heading.append(eyebrow, title);
  wrapper.append(heading, description, note, backButton);
  stage.append(wrapper);

  backButton.addEventListener("click", resetStage);

  return () => {
    backButton.removeEventListener("click", resetStage);
  };
}
