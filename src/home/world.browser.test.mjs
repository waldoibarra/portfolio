import assert from 'node:assert/strict';
import { join } from 'node:path';
import process from 'node:process';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

const modulePath = process.argv[2] || process.env.PLAYWRIGHT_MODULE;
if (!modulePath) {
  throw new Error('Pass an installed Playwright module path or set PLAYWRIGHT_MODULE.');
}
const { chromium } = await import(pathToFileURL(join(modulePath, 'index.mjs')).href);
const origin = process.env.WORLD_TEST_URL || 'http://localhost:4173/';
const views = ['map', 'workshop', 'observatory', 'garden', 'crossroads', 'connect'];

async function state(page) {
  return page.evaluate(() => ({
    hash: location.hash,
    place: document.documentElement.dataset.place,
    visible: [...document.querySelectorAll('[data-view]')]
      .filter(panel => !panel.hidden).map(panel => panel.id),
    current: [...document.querySelectorAll('.site-header nav [aria-current="location"]')]
      .map(link => link.hash),
    title: document.title,
    focused: document.activeElement?.id,
  }));
}

async function expectView(page, view, hash = `#${view}`) {
  await page.waitForFunction(expected => document.documentElement.dataset.place === expected, view);
  const actual = await state(page);
  assert.equal(actual.hash, hash);
  assert.equal(actual.place, view);
  assert.deepEqual(actual.visible, [view]);
  assert.deepEqual(actual.current, [`#${view}`]);
  const heading = view === 'map' ? 'Explore Waldo\'s world' :
    await page.locator(`#${view}-title`).innerText();
  assert.equal(actual.title, `${heading.trim().replace(/\s+/g, ' ')} | Waldo Ibarra`);
  return actual;
}

test('production world navigation and focus', { timeout: 60000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    assert.equal((await expectView(page, 'map', '')).focused, '');
    for (const view of views.slice(1)) {
      await page.locator(`.site-header nav a[href="#${view}"]`).click();
      assert.equal((await expectView(page, view)).focused, `${view}-title`);
    }
    await page.locator('.site-header nav a[href="#map"]').click();
    await expectView(page, 'map');
    await page.goBack();
    assert.equal((await expectView(page, 'connect')).focused, 'connect-title');
    await page.goForward();
    assert.equal((await expectView(page, 'map')).focused, 'map-title');

    for (const detail of ['workshop-practice', 'garden-balance']) {
      await page.goto(new URL(`#${detail}`, origin).href);
      const view = detail.split('-')[0];
      await expectView(page, view, `#${detail}`);
      assert.equal(await page.locator(`#${detail}`).evaluate(el => el.open), true);
      assert.equal(await page.locator(`#${detail} summary`)
        .evaluate(el => document.activeElement === el), true);
      await page.reload();
      await expectView(page, view, `#${detail}`);
      assert.equal(await page.locator(`#${detail}`).evaluate(el => el.open), true);
      assert.equal(await page.locator(`#${detail} summary`)
        .evaluate(el => document.activeElement === el), true);
    }
    for (const hash of ['#unknown', '#%E0%A4%A', '#%3Cimg%20src=x%20onerror=alert(1)%3E']) {
      await page.goto(new URL(hash, origin).href);
      await expectView(page, 'map');
      assert.equal(await page.locator('img[src="x"]').count(), 0);
    }
    await page.goto(new URL('#main', origin).href);
    await expectView(page, 'map', '#main');
    await page.goto(new URL('#workshop', origin).href);
    const hiddenTabStops = await page.evaluate(() =>
      [...document.querySelectorAll('[data-view][hidden] a, [data-view][hidden] summary')]
        .filter(el => el.getClientRects().length > 0 && el.tabIndex >= 0).length);
    assert.equal(hiddenTabStops, 0);
    await page.locator('.site-header nav a[href="#workshop"]').focus();
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() =>
        Boolean(document.activeElement.closest('[data-view][hidden]'))), false);
    }
    for (const repo of ['pi-lens', 'dotfiles']) {
      const link = page.locator(`.workshop-proof a[href="https://github.com/waldoibarra/${repo}"]`);
      assert.equal(await link.count(), 1);
    }
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const targets = await page.locator('.site-header nav a').evaluateAll(links =>
        links.map(link => {
          const rect = link.getBoundingClientRect();
          return { label: link.textContent.trim(), width: rect.width, height: rect.height };
        }));
      assert.ok(targets.every(target => target.width >= 44 && target.height >= 44),
        `Navigation targets at ${width}px: ${JSON.stringify(targets)}`);
      assert.equal(await page.evaluate(() =>
        document.documentElement.scrollWidth <= window.innerWidth), true);
    }
    assert.deepEqual(errors, []);
    await context.close();

    const noScript = await browser.newContext({
      javaScriptEnabled: false, reducedMotion: 'reduce',
    });
    try {
      const plain = await noScript.newPage();
      await plain.goto(origin);
      assert.equal(await plain.locator('[data-view]:visible').count(), views.length);
      await plain.locator('.landmark[href="#workshop"]').click();
      assert.equal(new URL(plain.url()).hash, '#workshop');
      await plain.locator('#workshop-practice summary').click();
      assert.equal(await plain.locator('#workshop-practice').evaluate(el => el.open), true);
    } finally {
      await noScript.close();
    }
  } finally {
    await browser.close();
  }
});
