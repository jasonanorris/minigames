const fs = require("node:fs");

const versionPath = "assets/js/version.js";
const packagePath = "package.json";
const lockPath = "package-lock.json";
const serviceWorkerPath = "sw.js";

const versionSource = fs.readFileSync(versionPath, "utf8");
const match = versionSource.match(/APP_VERSION = "0\.(\d{2})"/);

if (!match) {
  throw new Error(`Could not find the app version in ${versionPath}.`);
}

const nextMinor = Number.parseInt(match[1], 10) + 1;

if (nextMinor > 99) {
  throw new Error("Version bump passed 0.99. Choose the next versioning scheme.");
}

const displayVersion = `0.${String(nextMinor).padStart(2, "0")}`;
const packageVersion = `${displayVersion}.0`;

fs.writeFileSync(versionPath, `export const APP_VERSION = "${displayVersion}";\n`);

for (const path of [packagePath, lockPath]) {
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  data.version = packageVersion;

  if (path === lockPath) {
    data.packages[""].version = packageVersion;
  }

  fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

const serviceWorkerSource = fs.readFileSync(serviceWorkerPath, "utf8");
const updatedServiceWorker = serviceWorkerSource.replace(
  /const CACHE_NAME = "minigames-app-v[^"]+";/,
  `const CACHE_NAME = "minigames-app-v${displayVersion}";`
);

if (updatedServiceWorker === serviceWorkerSource) {
  throw new Error(`Could not update the cache version in ${serviceWorkerPath}.`);
}

fs.writeFileSync(serviceWorkerPath, updatedServiceWorker);
console.log(`MiniGames version bumped to ${displayVersion}.`);
