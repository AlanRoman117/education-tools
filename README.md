# Education Tools

Small, hands-on learning tools for kids, collected over time across many
subjects. Each tool is its own page that works on a tablet, a phone or a
computer, even offline.

**Live site: https://alanroman117.github.io/education-tools/**

Parents and teachers are welcome to use, copy and adapt anything here (see
[License](#license)).

## Tools

| Tool | Subject / topic | Ages |
| --- | --- | --- |
| [Number Pattern Lights](tools/math/counting/number-pattern-lights/) | Math / counting | 3–6 |

The full list, with age and subject filters, is on the home page
(`index.html`). That page reads `catalog.js`.

## Using it

- **On a tablet or phone:** open the live site, pick a tool, then use
  **Share → Add to Home Screen** so it opens full screen like an app.
- **On a computer:** open the live site, or download the repo and
  double-click `index.html`. No install or internet connection is needed.

## How the repo is organized

```
index.html          home page: every tool, filterable by age and subject
catalog.js          the list of tools (title, path, subject, topic, ages, skills)
shared/             styles and helpers every tool can use
  base.css          colors (including the number colors 1–10), fonts, buttons
  speech.js         EduTools.speech: say words out loud, mute button
tools/
  <subject>/
    <topic>/
      <tool-id>/    one self-contained tool: index.html, style.css, app.js,
                    README.md and tool.spec.js (its tests)
templates/tool/     starter files for a new tool
docs/
  adding-a-tool.md  steps, rules, subject list, age ranges
  testing.md        running and writing tests
  deployment.md     how changes get tested and published, one-time setup

Development only (not part of the site):
tests/              checks that run on every tool automatically
scripts/            local server (npm start) and site build (npm run build)
playwright.config.js  test devices: iPad, iPhone, ASUS ROG Flow Z13
.github/            CI workflow, Dependabot, branch ruleset
```

**Folders go subject → topic → tool. Age is a tag.** Each tool lists an age
range in `catalog.js`, and the home page filters on it. Tools don't move as a
child gets older, and one tool can serve several ages. The subject and topic
folders keep related tools together as the collection grows.

## Why one page per tool

Each tool is a small, self-contained page (its own mini app) with plain
HTML, CSS and JavaScript. They are not combined into one big app.

- **Independent.** A new tool can't break an old one, and a phonics tool can
  look and work nothing like a math tool.
- **Long-lasting.** No framework, build step or packages to update. The files
  keep working as they are.
- **Direct links.** Every tool has its own address to bookmark or put on a
  tablet's home screen.
- **Works offline.** Tools use classic `<script>` tags and load nothing from
  the internet, so they even run from a double-clicked file.

Shared pieces (colors, the voice) live in `shared/`, so tools still look and
behave alike. If you later want things like progress tracking across tools,
a single app could make sense then. The `subject/topic/tool` folders would
map directly onto its pages.

## Testing and publishing

Every pull request is tested in real browser engines at iPad, iPhone and Z13
sizes, and it gets a preview link to try on a device. Merging into `main`
tests again and then publishes the live site. A change that fails its tests
can't be merged and is never published. Details:
[docs/testing.md](docs/testing.md) and [docs/deployment.md](docs/deployment.md).

```sh
npm install        # once
npm test           # run all tests
npm start          # try the site locally, including from a tablet on your Wi-Fi
```

## Adding a tool

See [docs/adding-a-tool.md](docs/adding-a-tool.md).

## Privacy

Tools don't collect or send any data. Because the repo is public, it never
contains anything that identifies a child: names, photos, voice recordings,
school or location.

## License

[Apache License 2.0](LICENSE).
