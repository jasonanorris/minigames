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
let hadServiceWorkerController = false;
let isReloadingForUpdate = false;
let reloadOnControllerChange = false;
let serviceWorkerRegistration = null;
let touchStartY = 0;

function renderGameList() {
  gameList.innerHTML = "";

  for (const game of games) {
    const button = document.createElement("button");
    button.className = "game-card";
    button.type = "button";
    button.dataset.gameId = game.id;
    const isPlayable = typeof game.start === "function";
    button.disabled = !isPlayable;
    button.setAttribute(
      "aria-label",
      isPlayable ? game.title : `${game.title}, coming soon`
    );
    button.title = isPlayable ? game.title : `${game.title} - coming soon`;

    if (!isPlayable) {
      button.classList.add("is-placeholder");
    }

    button.innerHTML = `
      <span class="game-card-mark" aria-hidden="true">${game.mark}</span>
      <span class="game-card-title">${game.title}</span>
    `;

    if (isPlayable) {
      button.addEventListener("click", () => selectGame(game));
    }

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

  hadServiceWorkerController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    const isFirstInstall = !hadServiceWorkerController && !reloadOnControllerChange;
    hadServiceWorkerController = true;

    if (isFirstInstall || isReloadingForUpdate) {
      return;
    }

    isReloadingForUpdate = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("sw.js");
      serviceWorkerRegistration = registration;
      watchForServiceWorkerUpdate(registration);
      await registration.update();
    } catch {
      // The cached app remains usable when update checks fail or the device is offline.
    }
  });
}

function watchForServiceWorkerUpdate(registration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    markUpdateReady();
  }

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;

    if (!worker) {
      return;
    }

    worker.addEventListener("statechange", () => {
      if (worker.state !== "installed" || !navigator.serviceWorker.controller) {
        return;
      }

      if (reloadOnControllerChange) {
        activateWaitingWorker(registration);
        return;
      }

      markUpdateReady();
    });
  });
}

function markUpdateReady() {
  refreshButton.classList.remove("is-checking");
  refreshButton.classList.add("is-update-ready");
  refreshButton.disabled = false;
  refreshButton.setAttribute("aria-label", "Update app");
  refreshButton.title = "Update available";
}

function activateWaitingWorker(registration) {
  registration.waiting?.postMessage({ type: "SKIP_WAITING" });
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
  refreshButton.disabled = true;
  refreshButton.classList.add("is-checking");

  if (!("serviceWorker" in navigator)) {
    window.location.reload();
    return;
  }

  const registration =
    serviceWorkerRegistration || (await navigator.serviceWorker.getRegistration());

  if (!registration) {
    window.location.reload();
    return;
  }

  reloadOnControllerChange = true;

  if (registration.waiting) {
    activateWaitingWorker(registration);
    return;
  }

  await registration.update();

  if (registration.waiting) {
    activateWaitingWorker(registration);
    return;
  }

  if (registration.installing) {
    return;
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
