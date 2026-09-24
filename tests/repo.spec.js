// Checks on the files themselves (no browser): the catalog, the folder
// layout and the "works offline, from file://" rules. See docs/testing.md.
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { ROOT, loadCatalog, toolFolders, filesIn } = require('./helpers');

const { subjects, tools } = loadCatalog();
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));

test.describe('catalog.js', () => {
  test('subjects have unique kebab-case ids, titles and colors', () => {
    const ids = subjects.map((s) => s.id);
    expect(new Set(ids).size, 'duplicate subject id').toBe(ids.length);
    subjects.forEach((subject) => {
      expect(subject.id).toMatch(KEBAB);
      expect(subject.title, subject.id + ' needs a title').toBeTruthy();
      expect(subject.color, subject.id + ' needs a color').toBeTruthy();
    });
  });

  test('tool ids are unique', () => {
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size, 'duplicate tool id').toBe(ids.length);
  });

  for (const tool of tools) {
    test(`${tool.id}: entry is complete and points at its folder`, () => {
      expect(tool.id).toMatch(KEBAB);
      expect(tool.title && tool.title.trim(), 'title').toBeTruthy();
      expect(tool.description && tool.description.trim(), 'description').toBeTruthy();
      expect(subjects.map((s) => s.id), 'subject must be listed in EduTools.subjects').toContain(tool.subject);
      expect(tool.topic).toMatch(KEBAB);
      expect(tool.path).toBe(`tools/${tool.subject}/${tool.topic}/${tool.id}/index.html`);
      expect(exists(tool.path), tool.path + ' exists').toBe(true);

      expect(Array.isArray(tool.ages) && tool.ages.length, 'ages is [youngest, oldest]').toBe(2);
      const [youngest, oldest] = tool.ages;
      expect(Number.isInteger(youngest) && Number.isInteger(oldest), 'ages are whole years').toBe(true);
      expect(youngest).toBeGreaterThanOrEqual(2);
      expect(oldest).toBeLessThanOrEqual(18);
      expect(youngest).toBeLessThanOrEqual(oldest);

      expect(Array.isArray(tool.skills) && tool.skills.length > 0, 'at least one skill').toBe(true);
      tool.skills.forEach((skill) => expect(typeof skill === 'string' && skill.trim()).toBeTruthy());

      expect(tool.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(tool.added)), 'added is a real date').toBe(false);
    });
  }
});

test.describe('tool folders', () => {
  const folders = toolFolders();
  const listed = tools.map((t) => path.posix.dirname(t.path));
  const readme = read('README.md');

  test('every tool folder is listed in catalog.js', () => {
    expect(folders.filter((folder) => !listed.includes(folder)), 'folders missing from catalog.js').toEqual([]);
  });

  test('tool pages only live at tools/<subject>/<topic>/<tool>/', () => {
    const pages = filesIn('tools').filter((file) => file.endsWith('/index.html'));
    const misplaced = pages.filter((file) => file.split('/').length !== 5);
    expect(misplaced).toEqual([]);
  });

  for (const folder of folders) {
    test(`${folder}: has kebab-case names, a README, a spec and a row in the root README`, () => {
      folder.split('/').slice(1).forEach((name) => expect(name, 'folder name').toMatch(KEBAB));
      expect(exists(folder + '/index.html'), 'index.html').toBe(true);
      expect(exists(folder + '/README.md'), 'README.md').toBe(true);
      expect(exists(folder + '/tool.spec.js'), 'tool.spec.js').toBe(true);
      expect(readme.includes('(' + folder + '/)'), 'linked from the table in README.md').toBe(true);
    });
  }
});

test.describe('offline rules', () => {
  // Everything that ends up on the site, minus tests.
  const files = ['index.html', 'catalog.js']
    .concat(filesIn('shared'), filesIn('tools'))
    .filter((file) => /\.(html|css|js)$/.test(file) && !file.endsWith('.spec.js'));

  const RULES = [
    [/<script[^>]*type\s*=\s*["']?module/i, 'uses <script type="module"> (blocked on file://)'],
    [/\bfetch\s*\(/, 'uses fetch() (blocked on file://)'],
    [/\bXMLHttpRequest\b/, 'uses XMLHttpRequest (blocked on file://)'],
    [/^\s*(import|export)\s[^(]/m, 'uses import/export (ES modules are blocked on file://)'],
    [/\bimport\s*\(/, 'uses import() (blocked on file://)'],
    [/\b(src|href)\s*=\s*["']?\s*(https?:)?\/\//i, 'loads a file from the internet'],
    [/url\(\s*["']?\s*(https?:)?\/\//i, 'loads a file from the internet in CSS'],
    [/@import\s+(url\()?\s*["']?\s*(https?:)?\/\//i, 'imports CSS from the internet']
  ];

  for (const file of files) {
    test(`${file} works offline and from file://`, () => {
      const text = read(file);
      const broken = RULES.filter(([pattern]) => pattern.test(text)).map(([, why]) => why);
      expect(broken).toEqual([]);
    });
  }
});
