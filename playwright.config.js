const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4175",
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    serviceWorkers: "allow"
  },
  webServer: {
    command: "python3 -m http.server 4175",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: false
  }
});
