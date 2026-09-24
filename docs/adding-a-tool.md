# Adding a tool

Every tool lives in its own folder, and every folder is found the same way:

```
tools/<subject>/<topic>/<tool-id>/
```

Age is **not** part of the path. Each tool gets an age range in `catalog.js`,
and the home page filters by it. That way a tool never has to move as a child
grows, and a single tool can cover several ages.

## Steps

1. **Choose the subject and topic.** Use a subject from the table below. Use
   an existing topic folder if one fits, or make a new one (see naming).
2. **Copy the starter.** Copy `templates/tool/` to
   `tools/<subject>/<topic>/<tool-id>/`. It already links to the shared styles,
   the voice helper and the home page, and has a starter `tool.spec.js`.
3. **Build it.** Follow the rules below.
4. **Register it.** Add an entry to `catalog.js` (the fields are documented at
   the top of that file) and a row to the table in the root `README.md`.
5. **Describe it.** Fill in the tool's `README.md`: what it teaches, the ages,
   ideas for using it with a child.
6. **Test it.** Write the tool's behavior tests in `tool.spec.js` (see
   [testing.md](testing.md)), then run `npm test`. The shared checks already
   cover loading, `file://`, offline and screen fit on every device.
7. **Try it on a device.** Run `npm start` and open the Wi-Fi address on the
   iPad. Or open a pull request and use its preview link (see
   [deployment.md](deployment.md)).

## Rules for tools

- **Nothing personal.** The repo is public. Never add a child's name, photo,
  voice recording, school or location to a tool, a test or a doc. Tools don't
  collect or send data.
- **Plain HTML, CSS and JavaScript.** No framework and no build step. Tools
  never use npm packages (npm is only for tests). Tools should still open
  years from now without updates.
- **Classic `<script src>` only.** Don't use ES modules or `fetch()`, because
  browsers block both on `file://`. Shared code goes on `window.EduTools`.
- **Nothing loaded from the internet.** No CDN scripts or web fonts, so tools
  work offline.
- **Touch first.** Put `class="tool"` on `<body>`, keep tap targets at least
  48px, and make sure the tool fits a tablet screen with no scrolling.
- **Gentle motion.** Every animation must respect `prefers-reduced-motion`.
  `shared/base.css` handles this globally by removing all animations and
  transitions, so tools must use timers (`setTimeout`) and never wait for
  `animationend` or `transitionend`.
- **Local storage is only for small preferences** (mute, last setting). Wrap
  every read and write in `try/catch`. Key names start with `eduTools.`
  followed by the tool id, e.g. `eduTools.number-pattern-lights.size`.
- **Reuse `shared/`:**
  - `shared/base.css`: page colors, the number colors 1–10 (`data-digit="N"`
    sets `--c` and `--ink`), header and buttons.
  - `shared/speech.js`: `EduTools.speech.speak(text)` and
    `EduTools.speech.bindMuteButton(button)`.
  - When two tools need the same helper, move it into `shared/`.

## Subjects

| id | Examples of topics |
| --- | --- |
| `math` | counting, number-recognition, addition, subtraction, place-value, shapes, measurement, time, money, fractions |
| `reading` | letters, phonics, sight-words, rhyming, comprehension |
| `writing` | letter-tracing, spelling, sentences |
| `science` | animals, plants, weather, human-body, space, experiments |
| `social-studies` | maps, community, history, cultures |
| `languages` | spanish, sign-language, vocabulary |
| `arts` | colors, drawing, patterns |
| `music` | rhythm, notes, instruments |
| `life-skills` | emotions, routines, safety, cooking |
| `technology` | typing, coding, internet-safety |

A new subject needs an entry in `window.EduTools.subjects` in `catalog.js`.

## Naming

- Folders are lowercase kebab-case: `place-value`, `number-pattern-lights`.
- A topic is a skill area, not a single lesson. Use `counting`, not
  `counting-to-20`.
- The tool id is the tool's folder name and must be unique across the repo.

## Ages

`ages: [youngest, oldest]` in whole years. Rough stages to guide the choice:

| Stage | Ages |
| --- | --- |
| Toddler / preschool | 2–4 |
| Pre-K and kindergarten | 4–6 |
| Early elementary | 6–8 |
| Upper elementary | 8–11 |
| Middle school | 11–14 |
| High school | 14–18 |

Pick a range the tool actually suits, which is usually 3–4 years wide.
