// Number Pattern Lights: behavior tests. Run with `npm test`.
'use strict';

const { test, expect } = require('@playwright/test');
const { stubSpeech, spokenWords, watchPage } = require('../../../../tests/helpers');

const URL = '/tools/math/counting/number-pattern-lights/index.html';
const column = (digit) => Array.from({ length: 11 }, (_, row) => digit + row * 10);
const litNumbers = (page) =>
  page.$$eval('.cell.lit', (cells) => cells.map((cell) => Number(cell.textContent)));

test.beforeEach(async ({ page }) => {
  await stubSpeech(page);
  await page.goto(URL);
});

test('shows 1–110 and ten buttons', async ({ page }) => {
  await expect(page.locator('.cell')).toHaveCount(110);
  await expect(page.locator('.pad-btn')).toHaveCount(10);
  await expect(page.locator('.cell').first()).toHaveText('1');
  await expect(page.locator('.cell').last()).toHaveText('110');
});

test('tapping 1 lights 1, 11, 21 … 101', async ({ page }) => {
  await page.locator('.pad-btn[data-digit="1"]').click();
  expect(await litNumbers(page)).toEqual(column(1));
  expect(await spokenWords(page)).toEqual(['1']);
});

test('tapping 10 lights 10, 20 … 110', async ({ page }) => {
  await page.locator('.pad-btn[data-digit="10"]').click();
  expect(await litNumbers(page)).toEqual(column(10));
});

test('columns stay lit and the newest one pulses', async ({ page }) => {
  for (const digit of [1, 2, 3]) await page.locator(`.pad-btn[data-digit="${digit}"]`).click();
  expect((await litNumbers(page)).length).toBe(33);
  expect(await page.locator('.cell.newest').allTextContents()).toEqual(column(3).map(String));
  await expect(page.locator('.pad-btn.on')).toHaveCount(3);
});

test('lighting all ten columns celebrates, then the banner goes away', async ({ page }) => {
  for (let digit = 1; digit <= 10; digit++) {
    await page.locator(`.pad-btn[data-digit="${digit}"]`).click();
  }
  expect((await litNumbers(page)).length).toBe(110);
  await expect(page.locator('#banner')).toBeVisible();
  await expect(page.locator('.board')).toHaveClass(/celebrate/);
  expect(await spokenWords(page)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Great counting!']);
  await expect(page.locator('#banner')).toBeHidden({ timeout: 7000 });
});

test('tapping any number on the board says it', async ({ page }) => {
  for (const n of [13, 7, 20, 101]) {
    await page.locator(`.cell[data-number="${n}"]`).click();
  }
  expect(await spokenWords(page)).toEqual(['13', '7', '20', '101']);
});

test('a tapped number is ringed briefly and lights nothing', async ({ page }) => {
  const cell = page.locator('.cell[data-number="17"]');
  await cell.click();
  await expect(cell).toHaveClass(/\bsaid\b/);
  expect(await litNumbers(page)).toEqual([]);
  await expect(cell).not.toHaveClass(/\bsaid\b/, { timeout: 2000 });

  // Only one number is ringed at a time.
  await page.locator('.cell[data-number="3"]').click();
  await page.locator('.cell[data-number="4"]').click();
  await expect(page.locator('.cell.said')).toHaveCount(1);
  await expect(page.locator('.cell[data-number="4"]')).toHaveClass(/\bsaid\b/);
});

test('tapping board numbers keeps lit columns as they are', async ({ page }) => {
  await page.locator('.pad-btn[data-digit="2"]').click();
  await page.locator('.cell[data-number="55"]').click();
  expect(await litNumbers(page)).toEqual(column(2));
  expect(await spokenWords(page)).toEqual(['2', '55']);
});

test('muted board numbers stay silent', async ({ page }) => {
  await page.locator('#mute').click();
  await page.locator('.cell[data-number="12"]').click();
  expect(await spokenWords(page)).toEqual([]);
});

test('reset turns everything off', async ({ page }) => {
  await page.locator('.pad-btn[data-digit="4"]').click();
  await page.locator('#reset').click();
  expect(await litNumbers(page)).toEqual([]);
  await expect(page.locator('.pad-btn.on')).toHaveCount(0);
});

test('mute stops the voice and is remembered', async ({ page }) => {
  const mute = page.locator('#mute');
  await expect(mute).toBeVisible();
  await mute.click();
  await expect(mute).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.pad-btn[data-digit="5"]').click();
  expect(await spokenWords(page)).toEqual([]);

  await page.reload();
  await expect(page.locator('#mute')).toHaveAttribute('aria-pressed', 'true');
});

test('keyboard: 1–9 and 0 for the 10s', async ({ page }) => {
  await page.keyboard.press('0');
  expect(await litNumbers(page)).toEqual(column(10));
  await page.keyboard.press('7');
  expect((await litNumbers(page)).length).toBe(22);
});

test('each button sits under its own column', async ({ page }) => {
  for (let digit = 1; digit <= 10; digit++) {
    const button = await page.locator(`.pad-btn[data-digit="${digit}"]`).boundingBox();
    const cell = await page.locator('.cell').nth(digit - 1).boundingBox();
    const offset = Math.abs(button.x + button.width / 2 - (cell.x + cell.width / 2));
    expect(offset, `button ${digit} centered under column ${digit}`).toBeLessThan(2);
  }
});

test.describe('with reduced motion', () => {
  test('lights appear right away with no animation left running', async ({ page }) => {
    const problems = await watchPage(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    await page.locator('.pad-btn[data-digit="6"]').click();
    await page.waitForTimeout(100);
    const running = await page.evaluate(() =>
      document.getAnimations()
        .filter((a) => a.playState === 'running')
        .map((a) => `${a.constructor.name} ${a.animationName || a.transitionProperty} on .${a.effect.target.className}`)
    );
    expect(running, 'animations still running').toEqual([]);
    await expect(page.locator('.cell.lit')).toHaveCount(11);
    expect(problems).toEqual([]);
  });
});
