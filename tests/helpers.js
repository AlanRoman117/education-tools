// Shared helpers for the Playwright tests. See docs/testing.md.
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');

// Reads catalog.js the same way the home page does.
function loadCatalog() {
  const sandbox = { window: {} };
  const code = fs.readFileSync(path.join(ROOT, 'catalog.js'), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: 'catalog.js' });
  return {
    subjects: sandbox.window.EduTools.subjects,
    tools: sandbox.window.EduTools.catalog
  };
}

// file:// address of a repo file, e.g. fileUrl('index.html').
function fileUrl(relativePath) {
  return pathToFileURL(path.join(ROOT, relativePath)).href;
}

// Every folder at tools/<subject>/<topic>/<tool>, as a repo-relative path.
function toolFolders() {
  const found = [];
  const walk = (dir, depth) => {
    fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .forEach((entry) => {
        const child = dir + '/' + entry.name;
        if (depth === 3) found.push(child);
        else walk(child, depth + 1);
      });
  };
  walk('tools', 1);
  return found.sort();
}

// All files under a repo folder (repo-relative paths).
function filesIn(dir) {
  const found = [];
  const walk = (current) => {
    fs.readdirSync(path.join(ROOT, current), { withFileTypes: true }).forEach((entry) => {
      const child = current + '/' + entry.name;
      if (entry.isDirectory()) walk(child);
      else found.push(child);
    });
  };
  walk(dir);
  return found.sort();
}

function isLocal(url) {
  return /^(https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/|file:|data:|blob:|about:)/.test(url);
}

/*
 * Starts recording problems on a page: JS errors, console errors, files that
 * fail to load or return 4xx/5xx, and any request to another site (which is
 * blocked). Returns the list; a healthy page leaves it empty.
 */
async function watchPage(page) {
  const problems = [];
  page.on('pageerror', (error) => problems.push('JS error: ' + error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push('Console error: ' + message.text());
  });
  page.on('requestfailed', (request) => {
    if (isLocal(request.url())) {
      problems.push('Failed to load: ' + request.url() + ' (' + (request.failure() || {}).errorText + ')');
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push('HTTP ' + response.status() + ': ' + response.url());
  });
  await page.route((url) => !isLocal(url.href), (route) => {
    problems.push('Tried to load from the internet: ' + route.request().url());
    return route.abort();
  });
  return problems;
}

/*
 * Replaces the device voice with a recorder. Words the page would say are
 * collected in window.__spoken; read them with spokenWords(page).
 */
async function stubSpeech(page) {
  await page.addInitScript(() => {
    window.__spoken = [];
    const synth = {
      speaking: false,
      pending: false,
      speak(utterance) { window.__spoken.push(utterance.text); },
      cancel() {},
      pause() {},
      resume() {},
      getVoices() { return []; },
      addEventListener() {},
      removeEventListener() {},
      onvoiceschanged: null
    };
    function FakeUtterance(text) { this.text = String(text); }
    try {
      Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    } catch (e) {
      Object.defineProperty(Object.getPrototypeOf(window), 'speechSynthesis', { value: synth, configurable: true });
    }
    window.SpeechSynthesisUtterance = FakeUtterance;
  });
}

function spokenWords(page) {
  return page.evaluate(() => window.__spoken.slice());
}

module.exports = {
  ROOT,
  loadCatalog,
  fileUrl,
  toolFolders,
  filesIn,
  watchPage,
  stubSpeech,
  spokenWords
};
