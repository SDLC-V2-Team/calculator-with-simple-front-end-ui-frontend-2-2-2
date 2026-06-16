# Calculator

A simple, client-side calculator with a clean front-end UI. Built per **ADR-001 (Client-Side Only Architecture)** and **ADR-002 (Vanilla JavaScript for Frontend Logic)** — no backend, no frameworks, zero runtime dependencies.

## Tech Stack

- **HTML5** — single-page markup (`index.html`)
- **CSS3** — styling and responsive grid layout (`css/styles.css`)
- **Vanilla JavaScript (ES6 modules)** — UI controller and arithmetic engine (`js/`)

> Deliberately no React/Vue/jQuery and no build step, in line with the accepted ADRs.

## Features

- Basic arithmetic: addition, subtraction, multiplication, division
- Percent and sign (+/-) operations
- Decimal support with floating-point rounding to avoid IEEE-754 display noise
- Full keyboard support (digits, operators, `Enter`/`=`, `Esc` to clear)
- Divide-by-zero guarded with an `Error` display

## Project Structure

```
.
├── index.html            # App entry point / UI markup
├── css/
│   └── styles.css        # Styling
├── js/
│   ├── app.js            # DOM controller (event wiring + rendering)
│   └── calculator.js     # Pure arithmetic engine + state machine (testable)
├── tests/
│   └── calculator.test.js# Unit tests (Vitest)
├── package.json          # Dev tooling only (serve + vitest)
└── .gitignore
```

## Getting Started

Because the app is fully static, you can open `index.html` directly in a browser. ES modules require an HTTP origin, so the simplest path is a static server.

### Option A — npm (recommended)

```bash
npm install      # installs the dev-only static server + test runner
npm start        # serves the app at http://localhost:3000
```

### Option B — any static server

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Running Tests

```bash
npm test         # run the unit suite once
npm run test:watch
```

## Deployment

Serve the repository root as static files on any CDN or static host (GitHub Pages, Netlify, S3, etc.). No server runtime is required.

## License

MIT
