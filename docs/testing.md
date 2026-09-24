# Testing

Tests use [Playwright](https://playwright.dev), which drives real browser
engines: **WebKit** for iPad and iPhone (the same engine as Safari) and
**Chromium** for the ASUS ROG Flow Z13 (Chrome and Edge). They run on every
pull request, and the site only deploys if they pass (see
[deployment.md](deployment.md)).

npm is only used for development. The tools themselves never load anything
from `node_modules`.

## Commands

One-time setup:

```sh
npm install
npx playwright install chromium webkit
```

Then:

| Command | What it does |
| --- | --- |
| `npm test` | Runs every test on every device (about a minute) |
| `npx playwright test --project=ipad` | Runs just one device: `ipad`, `ipad-landscape`, `iphone`, `z13` or `repo-checks` |
| `npx playwright test tools/math` | Runs only tests under a folder |
| `npm run test:ui` | Opens Playwright's test window, where you can watch tests click through the tools |
| `npm run report` | Opens the last HTML report, with a screenshot of every tool on every device |
| `npm start` | Serves the site at http://localhost:8080 and prints a Wi-Fi address |
| `npm run build` | Builds `_site/`, which is exactly what gets published |

### Trying it on the real iPad before pushing

Run `npm start` on a computer. It prints an address like
`http://192.168.1.20:8080/`. Open that address in Safari on an iPad or iPhone
on the same Wi-Fi.

## What gets checked

| File | Checks | Runs on |
| --- | --- | --- |
| `tests/repo.spec.js` | Catalog entries are complete and point at real folders. Every tool folder is in the catalog and has a `README.md`, a `tool.spec.js` and a row in the root README. Names are kebab-case. No ES modules, `fetch()` or internet links (they break offline and `file://` use). | Once (no browser) |
| `tests/home.spec.js` | One card per tool, the age and subject filters, every card opens its tool, and the page works from `file://`. | Every device |
| `tests/tools-smoke.spec.js` | **Every tool automatically:** no errors, no missing files, nothing loaded from the internet, works from `file://`, has a Home link, no sideways scrolling. On tablets it also fits with no scrolling and every button is at least 44px. Saves a screenshot to the report. | Every device |
| `tools/**/tool.spec.js` | What makes that tool work (for example: tapping 1 lights 1, 11 … 101). | Every device |

The devices are defined in `playwright.config.js`:

| Project | Engine | Screen |
| --- | --- | --- |
| `ipad` | WebKit | 810×1080, touch |
| `ipad-landscape` | WebKit | 1080×810, touch |
| `iphone` | WebKit | 390×664, touch |
| `z13` | Chromium | 1280×800, touch (2560×1600 at 200%) |

## Writing a tool's tests

Each tool has a `tool.spec.js` in its own folder. The starter in
`templates/tool/tool.spec.js` shows the pattern. Things to know:

- Use `stubSpeech(page)` from `tests/helpers.js` before `page.goto()`. It
  records what the tool would say instead of playing it, and
  `spokenWords(page)` returns the list.
- `watchPage(page)` collects errors and blocked internet requests. Expect it
  to stay empty.
- Test behavior a child or parent would notice ("tapping 3 lights 13"), not
  internal details.
- Don't use fixed waits to paper over timing. Use `expect(...).toBeVisible()`
  and similar, which wait automatically.
- Retries are off on purpose. A test that fails sometimes has a real bug,
  either in the tool or in the test.

## Reading results in CI

On GitHub, open the pull request → **Checks** → **CI**. Failures appear on
the run summary with the file and line. The **playwright-report** artifact
(at the bottom of the run page) is the full HTML report: unzip it and open
`index.html`. It has a screenshot of every tool on every device, plus a
step-by-step trace for any failed test.

## If the browser download is blocked

Point `CHROMIUM_PATH` at a Chromium that's already installed, and the `z13`
project will use it:

```sh
CHROMIUM_PATH=/path/to/chromium npx playwright test --project=repo-checks --project=z13
```
