# MiniGames PWA Project Plan

## Goal

Build MiniGames as a lightweight HTML, CSS, and JavaScript progressive web app that can be installed on Android and launched from the home screen with an app-like full-screen experience.

## Core Requirements

- App name: MiniGames
- Technology: vanilla HTML, CSS, and JavaScript
- CSS and JavaScript libraries are allowed when they clearly improve the app
- Installable as a PWA on Android
- Friendly to iPhone Safari PWAs where reasonable
- Opens without the browser address bar when launched from the home screen
- Works offline after the first successful load
- Provides a simple structure for adding small games over time
- No ads, analytics, trackers, telemetry, or user profiling
- Free and open source so people can inspect the code and verify privacy claims

## Privacy and Open Source Principles

MiniGames should be privacy-respecting by design.

- Do not collect personal data
- Do not use analytics, advertising SDKs, tracking pixels, telemetry, or fingerprinting
- Do not send user data from a user's phone to third parties
- Do not require accounts, sign-ins, email addresses, or user profiles
- Store game progress locally on the device with `localStorage` or another local-only browser API
- Keep the app usable offline after the first successful load
- Publish the source code on GitHub under an open-source license
- Document the privacy model clearly in the repository
- Make it easy for users and developers to inspect the code and confirm what the app does

Third-party libraries, packages, and CDN-hosted assets are allowed only when they do not track users, profile users, collect personal data, inject ads, or send app/user data to third parties. Any third-party runtime request should be documented so users can understand what their device may contact and why.

Any future feature that sends user data over the network should be treated as a major product decision and documented before implementation.

## Library Approach

Start with plain HTML, CSS, and JavaScript so the app stays small, easy to host, and easy to debug on mobile.

Use a library when it gives us a meaningful advantage without making the project heavy or harder to maintain.

Good reasons to add a library:

- A game needs reliable physics, collisions, animation timing, or canvas helpers
- A UI pattern would be tedious or fragile to build by hand
- A small utility improves touch gestures, state handling, or local storage
- A library is lightweight, well-maintained, and works cleanly in a PWA
- The library is non-tracking and has a clear license
- CDN use is acceptable when the CDN request only fetches static code/assets and does not involve user tracking

Avoid libraries that:

- Require a large build setup before we need one
- Add a lot of unused CSS or JavaScript
- Make simple games harder to understand
- Interfere with offline caching or mobile performance
- Require third-party accounts, cloud services, analytics, telemetry, ads, user profiling, or tracking scripts

For privacy and offline reliability, prefer bundled or locally vendored libraries for production when practical. CDN usage should be listed in the privacy documentation if we choose it.

Potential library candidates:

- CSS: Pico CSS, Open Props, or a tiny custom design system
- Games: Phaser for more advanced 2D games
- Animation: Motion One or GSAP if built-in CSS animations are not enough
- Utilities: small focused modules only when a clear need appears

## Proposed Project Structure

```text
minigames/
  index.html
  manifest.json
  sw.js
  assets/
    css/
      styles.css
    js/
      app.js
      games/
        tap-race.js
    icons/
      icon-192.png
      icon-512.png
```

## Phase 1: App Shell

Create the base MiniGames interface.

- [x] Add `index.html`
- [x] Add a phone-first responsive layout
- [x] Show the app title and available games
- [x] Add a shared game area where selected games can run
- [x] Register the service worker from the main page
- [x] Add iPhone-friendly app meta tags
- [x] Add touch icon links once icon files exist

## Phase 2: PWA Manifest

Create `manifest.json` with Android-friendly app metadata.

- [x] Add `manifest.json`
- [x] Link the manifest from `index.html`
- [x] `name`: `MiniGames`
- [x] `short_name`: `MiniGames`
- [x] `start_url`: `/`
- [x] `scope`: `/`
- [x] `display`: `standalone`
- [x] `orientation`: `portrait`
- [x] `theme_color` and `background_color`
- [x] 192px and 512px app icons

Optional later experiment:

- [x] Try `display: fullscreen` for a more immersive game feel

iPhone-friendly additions:

- [x] Add `apple-mobile-web-app-capable`
- [x] Add `apple-mobile-web-app-title`
- [x] Add `apple-mobile-web-app-status-bar-style`
- [x] Add Apple touch icon links
- [x] Keep layout compatible with `viewport-fit=cover` and safe-area insets

## Phase 3: Service Worker

Create `sw.js` to cache the core app files.

- [x] Cache the app shell
- [x] Cache icons, CSS, and JavaScript
- [x] Cache the game registry module
- [x] Add starter game module files to the cache when Phase 5 creates them
- [x] Serve cached assets when offline
- [x] Update cache names when core files change
- [x] Cache third-party library files when allowed by browser and CDN rules so the app remains usable offline; no third-party files are currently used

## Phase 4: Game Registry

Create a small JavaScript registry for games.

- [x] Each game should define an id, title, description, and start function
- [x] The home screen should render the list from the registry
- [x] Selecting a game should mount it into the shared game area
- [x] Games should be easy to add without rewriting the app shell

## Phase 5: Starter Game

Build one playable starter game so the PWA is useful immediately.

Starter game: Tap Race

- [x] 10-second timer
- [x] Tap button
- [x] Live score
- [x] Restart button
- [x] Best score saved with `localStorage`

## Phase 6: Android Install Testing

Verify the PWA behavior on Android Chrome first, then do a reasonable iPhone Safari pass.

- App can be installed or added to the home screen
- Home screen icon appears correctly
- Launching from the icon opens without the browser address bar
- Manifest is detected correctly
- Service worker is registered
- App reloads while offline after the first visit
- On iPhone, Add to Home Screen creates an app-like icon
- On iPhone, launch layout respects the status bar and safe areas
- On iPhone, offline reload works after the first visit where supported

## Phase 7: Polish

Make the app feel finished on mobile.

- Touch-friendly controls
- Stable layout during gameplay
- Safe-area handling for modern phones
- App-like background and theme colors
- Optional install prompt button, implemented without tracking
- Optional offline status indicator

## Phase 8: More Games

Validate the game registry and lifecycle with additional games.

- [x] Reaction Time with randomized delay, early-tap detection, and local best time
- [ ] Memory Grid
- [ ] Quick Math

## Documentation and Trust

Add repository documentation that explains the privacy posture in plain language.

- [x] `README.md`: what MiniGames is, how to run it, and how to inspect it
- [x] `PRIVACY.md`: no personal data collection, no ads, no analytics, no tracking services
- [x] `LICENSE`: open-source license, likely MIT unless we choose another
- [x] `CONTRIBUTING.md`: guidelines for keeping contributions privacy-preserving

## First Implementation Milestone

Create the complete app shell with:

- `index.html`
- `manifest.json`
- `sw.js`
- `assets/css/styles.css`
- `assets/js/app.js`
- `assets/js/games/tap-race.js`
- generated or hand-created app icons
- [x] `README.md`
- [x] `PRIVACY.md`
- [x] `LICENSE`

At the end of this milestone, MiniGames should run locally, install as a PWA on Android, and include one playable mini game.

## Acceptance Checklist

- [ ] App loads in a browser
- [ ] App has a valid manifest
- [ ] App registers a service worker
- [ ] App shell is cached
- [ ] App works offline after first load
- [ ] Android can add/install it from Chrome
- [ ] Home screen launch uses app-like display mode
- [ ] iPhone Safari Add to Home Screen behavior is reasonably supported
- [x] Tap Race is playable
- [x] Best score persists locally
- [x] No ads, analytics, trackers, telemetry, profiling, or personal data collection
- [x] Any third-party package or CDN use is documented
- [x] Source code is ready to publish on GitHub
- [x] Privacy model is documented
