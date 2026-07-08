import { games } from "./games/index.js";
import { APP_VERSION } from "./version.js";

const HOME_THEME = {
  color: "#101820",
  tint: "rgba(61, 214, 208, 0.14)",
  tintSecondary: "rgba(247, 201, 72, 0.16)"
};
const gameList = document.querySelector("#game-list");
const gameStage = document.querySelector("#game-stage");
const stageTitle = document.querySelector("#stage-title");
const homeButton = document.querySelector("#home-button");
const refreshButton = document.querySelector("#refresh-button");
const themeColorMeta = document.querySelector("#theme-color");
const versionEl = document.querySelector("#app-version");
let activeCleanup = null;
let touchStartY = 0;

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
  applyTheme(game.theme);
  document.body.classList.add("is-playing");
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
  applyTheme(HOME_THEME);
  document.body.classList.remove("is-playing");
  stageTitle.textContent = "Choose a game";
  homeButton.hidden = true;
  gameStage.innerHTML = '<p class="empty-state">Select a game from the list to get started.</p>';
}

function applyTheme(theme) {
  const activeTheme = theme || HOME_THEME;
  document.documentElement.style.setProperty("--theme-color", activeTheme.color);
  document.documentElement.style.setProperty("--theme-tint", activeTheme.tint);
  document.documentElement.style.setProperty(
    "--theme-tint-secondary",
    activeTheme.tintSecondary
  );
  themeColorMeta.content = activeTheme.color;
}

function cleanupActiveGame() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

function preventPullToRefreshWhilePlaying() {
  window.addEventListener(
    "touchstart",
    (event) => {
      touchStartY = event.touches[0]?.clientY || 0;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!document.body.classList.contains("is-playing")) {
        return;
      }

      const touchY = event.touches[0]?.clientY || 0;
      const isPullingDown = touchY > touchStartY;
      const isAtTop = window.scrollY <= 0;

      if (isPullingDown && isAtTop) {
        event.preventDefault();
      }
    },
    { passive: false }
  );
}

async function refreshApp() {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  }

  window.location.reload();
}

homeButton.addEventListener("click", resetStage);
refreshButton.addEventListener("click", () => {
  refreshApp().catch(() => window.location.reload());
});
versionEl.textContent = `v${APP_VERSION}`;
applyTheme(HOME_THEME);
renderGameList();
registerServiceWorker();
preventPullToRefreshWhilePlaying();
