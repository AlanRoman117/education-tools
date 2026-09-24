// The home page (index.html): cards, filters and links. See docs/testing.md.
'use strict';

const { test, expect } = require('@playwright/test');
const { loadCatalog, fileUrl, watchPage } = require('./helpers');

const { subjects, tools } = loadCatalog();

test.describe('home page', () => {
  test('shows one card per tool, with no errors', async ({ page }) => {
    const problems = await watchPage(page);
    await page.goto('/index.html');
    await expect(page.locator('.card')).toHaveCount(tools.length);
    expect(problems).toEqual([]);
  });

  test('works when opened as a file', async ({ page }) => {
    const problems = await watchPage(page);
    await page.goto(fileUrl('index.html'));
    await expect(page.locator('.card')).toHaveCount(tools.length);
    expect(problems).toEqual([]);
  });

  test('age filter shows only tools for that age', async ({ page }) => {
    await page.goto('/index.html');
    for (let age = 2; age <= 18; age++) {
      const expected = tools.filter((t) => t.ages[0] <= age && age <= t.ages[1]).length;
      await page.selectOption('#age', String(age));
      await expect(page.locator('.card'), 'age ' + age).toHaveCount(expected);
      await expect(page.locator('.empty')).toHaveCount(expected ? 0 : 1);
    }
    await page.selectOption('#age', '');
    await expect(page.locator('.card')).toHaveCount(tools.length);
  });

  test('subject chips show only that subject', async ({ page }) => {
    await page.goto('/index.html');
    const used = subjects.filter((s) => tools.some((t) => t.subject === s.id));
    for (const subject of used) {
      await page.getByRole('button', { name: subject.title, exact: true }).click();
      await expect(page.locator('.card')).toHaveCount(tools.filter((t) => t.subject === subject.id).length);
    }
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.locator('.card')).toHaveCount(tools.length);
  });

  for (const tool of tools) {
    test(`card opens ${tool.title}`, async ({ page }) => {
      const problems = await watchPage(page);
      await page.goto('/index.html');
      await page.locator('.card', { hasText: tool.title }).click();
      await expect(page).toHaveURL(new RegExp(tool.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
      expect(problems).toEqual([]);
    });
  }
});
