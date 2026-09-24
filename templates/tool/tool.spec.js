// Tool Name: behavior tests. Run with `npm test`.
//
// The generic checks in tests/tools-smoke.spec.js already cover every tool:
// no errors, works from file://, nothing from the internet, a Home link, and
// fitting iPad, iPhone and Z13 screens. This file tests what makes THIS tool
// work. Replace <subject>/<topic>/<tool-id> below once the folder is copied.
'use strict';

const { test, expect } = require('@playwright/test');
const { stubSpeech, spokenWords } = require('../../../../tests/helpers');

const URL = '/tools/<subject>/<topic>/<tool-id>/index.html';

test.beforeEach(async ({ page }) => {
  await stubSpeech(page); // records speech instead of playing it
  await page.goto(URL);
});

test('starts ready to use', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText('Tool Name');
});

// Example: tapping something says a word.
// test('tapping the star says "star"', async ({ page }) => {
//   await page.getByRole('button', { name: 'Star' }).click();
//   expect(await spokenWords(page)).toEqual(['star']);
// });
