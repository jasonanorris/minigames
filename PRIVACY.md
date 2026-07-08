# Privacy

MiniGames is designed to be privacy-respecting and easy to inspect.

## What MiniGames Collects

MiniGames does not collect personal data.

MiniGames does not use:

- Analytics
- Ads
- Tracking pixels
- Telemetry
- Fingerprinting
- User accounts
- Sign-ins
- Remote error reporting

## Local Storage

MiniGames may store game data locally in your browser. For example, Tap Race stores your best score with `localStorage`.

That data stays on your device. It is not sent to the developer, GitHub, or any analytics service by the app code.

If you clear browser site data, local scores may be deleted.

## Network Requests

MiniGames is currently served by GitHub Pages. When you open the app, your browser requests the static app files from GitHub Pages.

The app itself currently does not make third-party runtime requests for analytics, ads, fonts, APIs, or tracking services.

Current first-party app files include:

- `index.html`
- `manifest.json`
- `sw.js`
- CSS
- JavaScript game files
- local icons

## Service Worker

MiniGames uses a service worker to cache app files so the app can work offline after the first successful load.

The service worker caches static app assets. It does not collect or transmit personal data.

## Future Changes

Any future feature that sends user data over a network should be treated as a major product decision and documented before implementation.

Any third-party package, CDN, API, or hosted asset should be documented so users can inspect what their device may contact and why.
