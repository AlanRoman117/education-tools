# Deployment

The site is published to GitHub Pages at
**https://alanroman117.github.io/education-tools/**. Everything goes through
one workflow, [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

```
change on a branch ──PR──► test ──fail──► red X, merging is blocked
                             │
                             └─pass─► preview ──► …/pr-preview/pr-<number>/
                                                  (link and QR code posted on the PR)
PR closed ─────────────────► preview-remove ──► preview deleted
merge into main ───────────► test ──pass──► deploy ──► live site (about 1 minute)
```

- **test** runs the whole Playwright suite on iPad, iPhone and Z13 (see
  [testing.md](testing.md)).
- **preview** publishes the pull request's version of the site to its own
  folder, so you can try it on the real iPad before merging. Pull requests
  from forks and from Dependabot are tested but don't get previews.
- **deploy** publishes `main` to the live site, but only after its tests pass
  again.

Previews and the live site both live on the `gh-pages` branch. It's managed by
the workflow, so don't edit it by hand.

## One-time GitHub setup

Do these once, in the repo's **Settings**:

1. **Default branch:** General → Default branch → switch to `main`.
2. **Make it public:** General → Danger Zone → Change visibility → Public.
   Pages and merge rules are free for public repos.
3. **Turn on Pages:** this can only be done after the first workflow run has
   created the `gh-pages` branch. Go to Pages → Build and deployment → Source
   "Deploy from a branch" → Branch `gh-pages`, folder `/ (root)` → Save.
4. **Block merges when tests fail:** Rules → Rulesets → New ruleset → Import
   a ruleset → choose `.github/rulesets/protect-main.json` from this repo.
   That requires a pull request and the `test` check for `main`, and blocks
   force-pushes and deletion.
5. *(Optional)* On the repo's main page, edit the **About** description so it
   doesn't mention anyone personally.

Nothing else is needed. The workflow gets write access only for the jobs that
publish, and it needs no secrets.

## Everyday flow

1. Work happens on a branch, and a pull request into `main` is opened.
2. Wait for the green check. The bot comment on the PR has the preview link
   and a QR code you can scan with the iPad camera.
3. Try the change on the iPad, iPhone or Z13.
4. Merge. The live site updates about a minute later.

## Rolling back

Open the merged pull request on GitHub and click **Revert**. That opens a new
pull request that undoes it. Merge it, and the tests and deploy run again,
putting back the previous version.

## Keeping it working

Dependabot opens update pull requests once a month for Playwright and the
GitHub Actions used here. They run the same tests, so merge them when they're
green.

## Privacy

The repo and site are public. Never commit anything that identifies a child:
names, photos, voice recordings, school, location or schedule. Tools don't
collect or send any data. Small preferences (like mute) stay on the device in
its local storage.
