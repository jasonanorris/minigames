# Contributing

Contributions are welcome, with one important rule: MiniGames should stay privacy-respecting by design.

## Privacy Requirements

Do not add:

- Ads
- Analytics
- Tracking scripts
- Telemetry
- Fingerprinting
- User profiling
- Required accounts
- Remote error reporting
- Personal data collection

Do not send user data to third parties.

## Dependencies

CSS and JavaScript libraries are allowed when they clearly improve the app, but they should be reviewed before use.

Before adding a dependency, check:

- Is it necessary?
- Is it open source?
- Is the license compatible with this project?
- Does it load remote code or assets?
- Does it collect data or phone home?
- Can it work offline?

If a third-party package, CDN, API, or hosted asset is used, document it in `PRIVACY.md`.

## Local Data

Prefer local-only browser APIs for scores and settings. If storage is unavailable, games should still work without crashing.

## Game Guidelines

Games should be:

- Touch-friendly
- Mobile-first
- Usable on Android
- Reasonably friendly to iPhone Safari
- Playable without accounts
- Playable offline after the app has loaded successfully

Games may return either a cleanup function or a lifecycle object from their `start`
function. Timed games should use the lifecycle object so backgrounding or locking the
phone does not consume play time:

```js
return {
  pause() {},
  resume() {},
  cleanup() {}
};
```

## Checks

Run the lightweight JavaScript checks before submitting changes:

```bash
npm run check
```

Run the browser tests for app navigation, mobile layouts, and game behavior:

```bash
npm test
```

## Versions

Before every push that changes the deployed app, bump the visible version by one hundredth:

```bash
npm run version:bump
```

This keeps the displayed version, package metadata, and service-worker cache version in sync.
