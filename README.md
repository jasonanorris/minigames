# MiniGames

MiniGames is a small, installable web app for quick browser games. It is built as a lightweight PWA with plain HTML, CSS, and JavaScript.

Live app:

https://jasonanorris.github.io/minigames/

## Project Principles

- Free to use
- Open source
- No ads
- No analytics
- No tracking
- No accounts
- No personal data collection

Game progress and scores are stored locally in the browser. MiniGames does not send personal data to a server.

## Current Games

- Tap Race: tap as fast as you can before the 10-second timer ends.

## Local Development

Serve the project from the repository root:

```bash
npm run serve
```

Then open:

```text
http://localhost:3000/
```

Service workers can cache old local files during development. If the page looks stale, clear the site data or unregister the local service worker in browser devtools.

## Checks

Current lightweight checks:

```bash
npm run check
```

## Privacy

See [PRIVACY.md](PRIVACY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MiniGames is released under the MIT License. See [LICENSE](LICENSE).
