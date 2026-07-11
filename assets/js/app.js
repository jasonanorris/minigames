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
const stageEyebrow = document.querySelector("#stage-eyebrow");
const homeButton = document.querySelector("#home-button");
const smallGameBackButton = document.querySelector("#small-game-back");
const controllerButtons = document.querySelectorAll(".controller-button");
const networkStatusEl = document.querySelector("#network-status");
const refreshButton = document.querySelector("#refresh-button");
const themeColorMeta = document.querySelector("#theme-color");
const versionEl = document.querySelector("#app-version");
const gameLibrary = document.querySelector(".game-library");
const LAUNCH_ANIMATION_MS = 220;
const LAUNCHER_STATE = { view: "launcher", guarded: true };
const LAUNCHER_BOUNDARY_STATE = { view: "launcher-boundary" };
let activeCleanup = null;
let activePause = null;
let activeResume = null;
let hadServiceWorkerController = false;
let isReloadingForUpdate = false;
let isLaunchingGame = false;
let lastFocusedGameControl = null;
let lastLauncherGameId = null;
let launcherScrollTop = 0;
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
      <span class="game-card-mark" data-mark="${game.mark}" aria-hidden="true"></span>
      <span class="game-card-title">${game.title}</span>
    `;

    if (isPlayable) {
      button.addEventListener("click", () => launchGame(game, button));
    }

    gameList.append(button);
  }
}

function launchGame(game, button) {
  if (isLaunchingGame) {
    return;
  }

  isLaunchingGame = true;
  lastLauncherGameId = game.id;
  launcherScrollTop = gameLibrary.scrollTop;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    selectGame(game);
    return;
  }

  button.classList.add("is-launching");
  window.setTimeout(() => selectGame(game), LAUNCH_ANIMATION_MS);
}

function selectGame(game, { updateHistory = true } = {}) {
  isLaunchingGame = false;
  lastLauncherGameId = game.id;
  gameList.querySelector(".is-launching")?.classList.remove("is-launching");

  if (updateHistory) {
    const method = history.state?.view === "game" ? "replaceState" : "pushState";
    history[method]({ view: "game", gameId: game.id }, "", window.location.href);
  }

  cleanupActiveGame();
  applyTheme(game.theme);
  const isSmallGame = game.displayMode === "small";
  document.body.classList.toggle("is-small-game", isSmallGame);
  document.body.classList.add("is-playing");
  stageEyebrow.textContent = isSmallGame ? "Small game" : "Play area";
  stageTitle.textContent = game.title;
  homeButton.hidden = isSmallGame;
  smallGameBackButton.hidden = !isSmallGame;
  gameStage.innerHTML = "";

  const lifecycle = game.start({
    game,
    stage: gameStage,
    resetStage
  });

  if (typeof lifecycle === "function") {
    activeCleanup = lifecycle;
  } else {
    activeCleanup = lifecycle?.cleanup || null;
    activePause = lifecycle?.pause || null;
    activeResume = lifecycle?.resume || null;
  }

  gameStage.focus();
}

function handlePopState(event) {
  if (event.state?.view === "game") {
    const game = games.find(
      (candidate) =>
        candidate.id === event.state.gameId && typeof candidate.start === "function"
    );

    if (game) {
      selectGame(game, { updateHistory: false });
      return;
    }
  }

  resetStage();

  if (event.state?.view !== "launcher" || !event.state.guarded) {
    armLauncherBackGuard();
  }
}

function returnToLauncher() {
  if (history.state?.view === "game") {
    history.back();
    return;
  }

  resetStage();
}

function handleControllerButton(control) {
  const controlEvent = new CustomEvent("minigames:control", {
    bubbles: true,
    cancelable: true,
    detail: { control }
  });

  if (!gameStage.dispatchEvent(controlEvent)) {
    return;
  }

  if (control === "b") {
    if (document.body.classList.contains("is-playing")) {
      returnToLauncher();
    }

    return;
  }

  if (!document.body.classList.contains("is-playing")) {
    gameList.querySelector(".game-card:not(:disabled)")?.focus();
    return;
  }

  const focusedControl = lastFocusedGameControl;

  if (
    focusedControl &&
    gameStage.contains(focusedControl) &&
    focusedControl.matches("button:not(:disabled)")
  ) {
    focusedControl.click();
    return;
  }

  const primaryControl = gameStage.querySelector("#tap-target, #reaction-target");

  if (primaryControl) {
    primaryControl.click();
    return;
  }

  gameStage.querySelector("button:not(:disabled)")?.focus();
}

function resetStage() {
  cleanupActiveGame();
  lastFocusedGameControl = null;
  applyTheme(HOME_THEME);
  document.body.classList.remove("is-playing", "is-small-game");
  stageEyebrow.textContent = "Play area";
  stageTitle.textContent = "Choose a game";
  homeButton.hidden = true;
  smallGameBackButton.hidden = true;
  gameStage.innerHTML = '<p class="empty-state">Select a game from the list to get started.</p>';

  window.requestAnimationFrame(() => {
    gameList
      .querySelector(`[data-game-id="${lastLauncherGameId}"]`)
      ?.focus({ preventScroll: true });
    gameLibrary.scrollTop = launcherScrollTop;
  });
}

function armLauncherBackGuard() {
  history.replaceState(LAUNCHER_BOUNDARY_STATE, "", window.location.href);
  history.pushState(LAUNCHER_STATE, "", window.location.href);
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

function updateNetworkStatus() {
  const isOnline = navigator.onLine;
  networkStatusEl.classList.toggle("is-offline", !isOnline);
  networkStatusEl.setAttribute("aria-label", isOnline ? "Online" : "Offline");
  networkStatusEl.title = isOnline ? "Online" : "Offline";
}

function cleanupActiveGame() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  activePause = null;
  activeResume = null;
}

function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    activePause?.();
    return;
  }

  activeResume?.();
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

function getScrollableTouchTarget(target) {
  const scrollable = target?.closest?.(".wheel-prizes");

  if (!scrollable) {
    return null;
  }

  return scrollable.scrollHeight > scrollable.clientHeight ? scrollable : null;
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
      if (getScrollableTouchTarget(event.target)) {
        return;
      }

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

homeButton.addEventListener("click", returnToLauncher);
smallGameBackButton.addEventListener("click", returnToLauncher);
gameStage.addEventListener("focusin", (event) => {
  if (event.target.matches("button:not(:disabled)")) {
    lastFocusedGameControl = event.target;
  }
});
for (const button of controllerButtons) {
  button.addEventListener("click", () => handleControllerButton(button.dataset.control));
}
refreshButton.addEventListener("click", () => {
  refreshApp().catch(() => window.location.reload());
});
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
window.addEventListener("popstate", handlePopState);
document.addEventListener("visibilitychange", handleVisibilityChange);
versionEl.textContent = `v${APP_VERSION}`;
updateNetworkStatus();
applyTheme(HOME_THEME);
renderGameList();

if (history.state?.view !== "game") {
  armLauncherBackGuard();
} else if (history.state.view === "game") {
  handlePopState({ state: history.state });
}

registerServiceWorker();
preventPullToRefreshWhilePlaying();
