// Basic checks that run on EVERY tool in catalog.js, on every device in
// playwright.config.js. A new tool gets these for free. See docs/testing.md.
'use strict';

const { test, expect } = require('@playwright/test');
const { loadCatalog, fileUrl, watchPage } = require('./helpers');

const { tools } = loadCatalog();
const MIN_TAP = 44; // CSS px; Apple's minimum touch target

for (const tool of tools) {
  test.describe(tool.title, () => {
    test('loads with no errors and nothing from the internet', async ({ page }, testInfo) => {
      const problems = await watchPage(page);
      await page.goto('/' + tool.path);
      await page.waitForLoadState('networkidle');
      expect(problems).toEqual([]);
      await expect(page.locator('body')).toHaveClass(/(^|\s)tool(\s|$)/);
      expect((await page.title()).trim()).not.toBe('');

      // Screenshot in the HTML report, one per device.
      await testInfo.attach(`${tool.id} on ${testInfo.project.name}`, {
        body: await page.screenshot(),
        contentType: 'image/png'
      });
    });

    test('works when opened as a file', async ({ page }) => {
      const problems = await watchPage(page);
      await page.goto(fileUrl(tool.path));
      await page.waitForLoadState('load');
      expect(problems).toEqual([]);
    });

    test('has a link back to the home page', async ({ page }) => {
      await page.goto('/' + tool.path);
      const homeLinks = await page.$$eval('a[href]', (links) =>
        links.filter((a) => new URL(a.href).pathname === '/index.html').length
      );
      expect(homeLinks, 'a link to ../../../../index.html').toBeGreaterThan(0);
    });

    test('fits the screen', async ({ page }, testInfo) => {
      await page.goto('/' + tool.path);
      await page.waitForLoadState('load');
      const size = await page.evaluate(() => {
        const d = document.documentElement;
        return { sw: d.scrollWidth, cw: d.clientWidth, sh: d.scrollHeight, ch: d.clientHeight };
      });
      expect(size.sw, 'no sideways scrolling').toBeLessThanOrEqual(size.cw);

      if (testInfo.project.metadata.tablet) {
        expect(size.sh, 'fits a tablet with no scrolling').toBeLessThanOrEqual(size.ch);

        const small = await page.$$eval(
          'button, a[href], input, select, [role="button"]',
          (elements, min) => elements
            .filter((el) => el.offsetParent !== null)
            .map((el) => {
              const r = el.getBoundingClientRect();
              return { label: el.getAttribute('aria-label') || el.textContent.trim(), w: r.width, h: r.height };
            })
            .filter((box) => box.w < min - 0.5 || box.h < min - 0.5)
            .map((box) => `${box.label} (${Math.round(box.w)}×${Math.round(box.h)})`),
          MIN_TAP
        );
        expect(small, `tap targets at least ${MIN_TAP}px`).toEqual([]);
      }
    });
  });
}
