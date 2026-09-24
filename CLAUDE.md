# Notes for Claude

A collection of small learning tools for kids. The conventions below are
spelled out in full in `docs/adding-a-tool.md`, `docs/testing.md` and
`docs/deployment.md`. Follow them when adding or changing a tool.

- **The repo is public.** Never commit anything that identifies a child:
  names, photos, voice recordings, school, location, schedules. Write docs and
  UI text in neutral terms ("the child", "your child"). Tools never collect
  or send data.
- New tools go in `tools/<subject>/<topic>/<tool-id>/`, starting from a copy
  of `templates/tool/`. Age is never part of a path. It goes in the tool's
  `ages` range in `catalog.js`.
- Every new tool needs a `catalog.js` entry, a `README.md` and a
  `tool.spec.js` in its folder, plus a row in the table in the root
  `README.md`. `tests/repo.spec.js` fails if any are missing.
- Plain HTML/CSS/JS only: classic `<script src>` (no ES modules, no
  `fetch`), no frameworks, no build step, no network dependencies. Pages must
  work from `file://`. npm is only for development (tests, `npm start`,
  `npm run build`). Tools never load anything from `node_modules`.
- Reuse `shared/base.css` (number colors via `data-digit`, header, buttons)
  and `shared/speech.js` (`EduTools.speech`). Move a helper into `shared/`
  once two tools need it.
- Touch first: `class="tool"` on `<body>`, tap targets ≥ 48px (tests
  enforce ≥ 44px on tablets), fits a tablet without scrolling, respects
  `prefers-reduced-motion`.
- Before pushing, run `npm test`. Only Chromium may be installed in a cloud
  session. In that case run
  `npx playwright test --project=repo-checks --project=z13`, and CI covers
  the WebKit (iPad and iPhone) projects. Never add retries or skip tests to
  get green.
- Work goes on a branch and a pull request into `main`. CI tests it and posts
  a preview link. Merging deploys to GitHub Pages. Don't edit the `gh-pages`
  branch by hand.
