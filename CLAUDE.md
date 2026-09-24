# Notes for Claude

A collection of small learning tools for kids. The conventions below are
spelled out in full in `docs/adding-a-tool.md`. Follow them when adding or
changing a tool.

- New tools go in `tools/<subject>/<topic>/<tool-id>/`, starting from a copy
  of `templates/tool/`. Age is never part of a path. It goes in the tool's
  `ages` range in `catalog.js`.
- Every new tool needs a `catalog.js` entry and a `README.md` in its folder.
  Add it to the table in the root `README.md` too.
- Plain HTML/CSS/JS only: classic `<script src>` (no ES modules, no
  `fetch`), no frameworks, no build step, no network dependencies. Pages must
  work from `file://`.
- Reuse `shared/base.css` (number colors via `data-digit`, header, buttons)
  and `shared/speech.js` (`EduTools.speech`). Move a helper into `shared/`
  once two tools need it.
- Touch first: `class="tool"` on `<body>`, tap targets ≥ 48px, fits a tablet
  without scrolling, respects `prefers-reduced-motion`.
- To check a change, open the page from `file://` and through
  `python3 -m http.server` in Chromium. Test at tablet portrait (820×1180),
  tablet landscape (1180×820) and phone (390×844) sizes.
