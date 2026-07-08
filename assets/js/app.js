import { games } from "./games/index.js";

const gameList = document.querySelector("#game-list");
const gameStage = document.querySelector("#game-stage");
const stageTitle = document.querySelector("#stage-title");
const homeButton = document.querySelector("#home-button");
const appStatus = document.querySelector("#app-status");
let activeCleanup = null;

function renderGameList() {
  gameList.innerHTML = "";

  for (const game of games) {
    const button = document.createElement("button");
    button.className = "game-card";
    button.type = "button";
    button.dataset.gameId = game.id;
    button.innerHTML = `
      <span>
        <h3>${game.title}</h3>
        <p>${game.description}</p>
      </span>
      <span class="badge">${game.status}</span>
    `;
    button.addEventListener("click", () => selectGame(game));
    gameList.append(button);
  }
}

function selectGame(game) {
  cleanupActiveGame();
  stageTitle.textContent = game.title;
  homeButton.hidden = false;
  gameStage.innerHTML = "";

  const cleanup = game.start({
    game,
    stage: gameStage,
    resetStage
  });

  activeCleanup = typeof cleanup === "function" ? cleanup : null;
  gameStage.focus();
}

function resetStage() {
  cleanupActiveGame();
  stageTitle.textContent = "Choose a game";
  homeButton.hidden = true;
  gameStage.innerHTML = '<p class="empty-state">Select a game from the list to get started.</p>';
}

function cleanupActiveGame() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    appStatus.textContent = "Browser";
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => {
        appStatus.textContent = "PWA ready";
      })
      .catch(() => {
        appStatus.textContent = "Ready";
      });
  });
}

homeButton.addEventListener("click", resetStage);
renderGameList();
registerServiceWorker();
