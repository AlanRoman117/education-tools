# Education Tools

Small, hands-on learning tools for kids, collected over time across many
subjects. Each tool is its own page. You can open it from the folder, host it
on GitHub Pages, or add it to a tablet's home screen.

## Tools

| Tool | Subject / topic | Ages |
| --- | --- | --- |
| [Number Pattern Lights](tools/math/counting/number-pattern-lights/) | Math / counting | 3–6 |

The full list, with age and subject filters, is on the home page
(`index.html`). That page reads `catalog.js`.

## Using it

- **On this computer:** open `index.html` in a browser. No install or server
  is needed.
- **On a tablet or phone:** turn on GitHub Pages (repo **Settings → Pages →
  Deploy from a branch**, then choose the branch and `/ (root)`). Open the
  site and use **Share → Add to Home Screen** on a tool so it opens full
  screen.

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
      <tool-id>/    one self-contained tool: index.html, style.css, app.js, README.md
templates/tool/     starter files for a new tool
docs/
  adding-a-tool.md  steps, rules, subject list, age ranges
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

## Adding a tool

See [docs/adding-a-tool.md](docs/adding-a-tool.md).
