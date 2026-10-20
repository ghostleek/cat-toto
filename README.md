# Cat-Toto

Cat-Toto is a simple, cat-powered random picker. Tap the big paw button to choose a number or let your cat trigger a pick with a swipe.

## Use the picker

- **Range:** Choose a minimum and maximum number. The default range is 1–49.
- **My Options:** Enter choices separated by commas, then let the picker choose one.
- **Lick Mode:** Turn this on to pick with an upward swipe on a touch screen or an upward scroll over the picker. Picks in this mode include a confetti celebration.
- **History:** See your recent picks or clear the list. The history keeps up to 24 picks.

## Run locally

You can open `index.html` directly in a browser, or serve the project directory:

```sh
python3 -m http.server
```

Then visit <http://localhost:8000>.

## Tests

Run the core picker tests with Node.js:

```sh
npm test
```

The browser-based Lick Mode tests use Playwright. Install the development dependency and Chromium if needed, then start a local server on port 8090 in one terminal:

```sh
npm install
npx playwright install chromium
python3 -m http.server 8090
```

In another terminal, run:

```sh
npm run test:e2e
```

## Deployment

The site is published to GitHub Pages by the workflow in `.github/workflows/jekyll-gh-pages.yml` when changes are pushed to `main`. The app is a static page; it has no build step or runtime dependencies.
