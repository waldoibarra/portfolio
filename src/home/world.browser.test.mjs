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
    current: [...document.querySelectorAll('[data-location][aria-current="location"]')]
      .map(link => link.hash),
    title: document.title,
    focused: document.activeElement?.id,
  }));
}

async function expectTop(page, view) {
  await page.waitForFunction(() => window.scrollY === 0);
  const geometry = await page.evaluate(view => {
    const title = document.getElementById(`${view}-title`).getBoundingClientRect();
    const localNav = document.querySelector(`#${view} [data-location]`).getBoundingClientRect();
    return { scrollY, titleTop: title.top, navTop: localNav.top, navBottom: localNav.bottom };
  }, view);
  assert.equal(geometry.scrollY, 0);
  const viewportHeight = await page.evaluate(() => innerHeight);
  assert.ok(geometry.navTop >= 0 && geometry.navBottom <= viewportHeight,
    JSON.stringify(geometry));
  assert.ok(geometry.titleTop >= 0, JSON.stringify(geometry));
}

async function expectDetail(page, detail) {
  const geometry = await page.locator(`#${detail} summary`).evaluate(summary => {
    const rect = summary.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: innerHeight };
  });
  assert.ok(geometry.top >= 8 && geometry.bottom <= geometry.height - 8,
    `${detail}: ${JSON.stringify(geometry)}`);
}

async function expectView(page, view, hash = `#${view}`) {
  await page.waitForFunction(expected => document.documentElement.dataset.place === expected, view);
  const actual = await state(page);
  assert.equal(actual.hash, hash);
  assert.equal(actual.place, view);
  assert.deepEqual(actual.visible, [view]);
  assert.deepEqual(actual.current, [`#${view}`]);
  const heading = view === 'map' ? 'Explore Waldo\'s library' :
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
    assert.equal(await page.locator('.map-view [data-location="map"]')
      .getAttribute('aria-current'), 'location');
    assert.equal(await page.locator('header, footer').count(), 0);
    await page.getByRole('button', { name: 'Follow a connection' }).click();
    assert.equal(await page.locator('[data-lens-panel="connections"]:visible').count(), 1);
    assert.equal(await page.locator('[data-lens-control]').getAttribute('data-selected'),
      'connections');
    await page.waitForFunction(() =>
      getComputedStyle(document.querySelector('[data-lens-choice="connections"]'))
        .backgroundColor === 'rgb(233, 217, 173)');
    if (process.env.WORLD_CAPTURE) {
      await page.screenshot({ path: `${process.env.WORLD_CAPTURE}/connections-1440.png` });
    }
    assert.equal(await page.getByLabel('Connections', { exact: true }).evaluate(el =>
      document.activeElement === el), true);
    await page.locator('#map [data-location="map"]').click();
    await expectTop(page, 'map');
    assert.equal(await page.locator('[data-lens-panel]:visible').count(), 1);
    await page.getByLabel('Shelves', { exact: true }).check();
    await page.getByLabel('Shelves', { exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[data-lens-panel="connections"]:visible').count(), 1);
    await page.getByLabel('Shelves', { exact: true }).check();
    await page.getByLabel('Connections', { exact: true }).check();
    assert.equal(await page.locator('[data-lens-panel="connections"]:visible').count(), 1);
    assert.equal(await page.locator('.connection-index li').count(), 4);
    await page.locator('.connection-index a[href="#observatory-coherence"]').click();
    await expectView(page, 'observatory', '#observatory-coherence');
    await expectDetail(page, 'observatory-coherence');
    await page.locator('#observatory .domain-top a[href="#map"]').click();
    await page.getByLabel('Connections', { exact: true }).check();
    await page.getByLabel('Shelves', { exact: true }).check();
    assert.equal(await page.locator('[data-lens-panel="shelves"]:visible').count(), 1);
    for (const view of views.slice(1)) {
      await page.goto(origin);
      await page.locator(`#map a[href="#${view}"]`).first().click();
      assert.equal((await expectView(page, view)).focused, `${view}-title`);
      await expectTop(page, view);
      assert.equal(await page.locator(`#${view} .domain-top a[href="#map"]`).count(), 1);
      if (view !== 'connect') {
        assert.equal(await page.locator(`#${view} .topic-nav a`).count() > 1, true);
        assert.equal(await page.locator(`#${view} .domain-top a[href="#connect"]`).count(), 1);
      }
    }
    await page.locator('#connect .domain-top a[href="#map"]').click();
    await expectView(page, 'map');
    await expectTop(page, 'map');
    await page.goBack();
    assert.equal((await expectView(page, 'connect')).focused, 'connect-title');
    await expectTop(page, 'connect');
    await page.goForward();
    assert.equal((await expectView(page, 'map')).focused, 'map-title');
    await expectTop(page, 'map');

    await page.goto(new URL('#workshop', origin).href);
    await expectTop(page, 'workshop');
    await page.reload();
    await expectTop(page, 'workshop');
    assert.equal(await page.locator('.workshop .journal-plate').evaluate(el =>
      el.getAnimations().length), 0);
    await page.locator('#workshop .domain-next').scrollIntoViewIfNeeded();
    const historyLength = await page.evaluate(() => history.length);
    await page.locator('#workshop [data-location="workshop"]').click();
    await expectTop(page, 'workshop');
    assert.equal(await page.evaluate(() => history.length), historyLength);
    await page.locator('#workshop .domain-next a').click();
    await expectView(page, 'observatory');
    await expectTop(page, 'observatory');
    await page.goBack();
    await expectView(page, 'workshop');
    await expectTop(page, 'workshop');
    await page.goForward();
    await expectView(page, 'observatory');
    await expectTop(page, 'observatory');
    await page.locator('#observatory .domain-top a[href="#map"]').click();
    await expectView(page, 'map');
    await expectTop(page, 'map');

    for (const detail of ['workshop-practice', 'garden-balance',
      'workshop-policy', 'workshop-verification', 'workshop-native', 'workshop-delivery',
      'observatory-evidence', 'observatory-learning-map', 'garden-experiments',
      'garden-attention', 'crossroads-decisions', 'crossroads-perspectives']) {
      await page.goto(new URL(`#${detail}`, origin).href);
      const view = detail.split('-')[0];
      await expectView(page, view, `#${detail}`);
      assert.equal(await page.locator(`#${detail}`).evaluate(el => el.open), true);
      assert.equal(await page.locator(`#${detail} summary`)
        .evaluate(el => document.activeElement === el), true);
      await expectDetail(page, detail);
      await page.reload();
      await expectView(page, view, `#${detail}`);
      assert.equal(await page.locator(`#${detail}`).evaluate(el => el.open), true);
      assert.equal(await page.locator(`#${detail} summary`)
        .evaluate(el => document.activeElement === el), true);
      await expectDetail(page, detail);
    }
    for (const hash of ['#unknown', '#%E0%A4%A', '#%3Cimg%20src=x%20onerror=alert(1)%3E']) {
      await page.goto(new URL(hash, origin).href);
      await expectView(page, 'map');
      assert.equal(await page.locator('img[src="x"]').count(), 0);
    }
    await page.goto(new URL('#main', origin).href);
    await expectView(page, 'map', '#main');
    await page.goto(origin);
    await page.locator('.skip-link').focus();
    await page.keyboard.press('Enter');
    await expectView(page, 'map', '');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'main');
    const mainTop = await page.locator('#main').evaluate(main => main.getBoundingClientRect().top);
    assert.ok(mainTop >= 0);
    for (const hash of ['#garden', '#garden-balance']) {
      await page.goto(new URL(hash, origin).href);
      await expectView(page, 'garden', hash);
      const previousHistoryLength = await page.evaluate(() => history.length);
      await page.locator('.skip-link').focus();
      await page.keyboard.press('Enter');
      await expectView(page, 'garden', hash);
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'main');
      assert.equal(await page.evaluate(() => history.length), previousHistoryLength);
      await page.reload();
      await expectView(page, 'garden', hash);
    }
    await page.goto(new URL('#workshop', origin).href);
    const hiddenTabStops = await page.evaluate(() =>
      [...document.querySelectorAll('[data-view][hidden] a, [data-view][hidden] summary')]
        .filter(el => el.getClientRects().length > 0 && el.tabIndex >= 0).length);
    assert.equal(hiddenTabStops, 0);
    await page.locator('#workshop [data-location="workshop"]').focus();
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() =>
        Boolean(document.activeElement.closest('[data-view][hidden]'))), false);
    }
    const publicProof = [
      'https://github.com/waldoibarra/dotfiles/blob/main/' +
        'scripts/update-coding-agents/sync-cursor-rule.sh',
      'https://github.com/waldoibarra/dotfiles/blob/main/docs/ai-harness/harness-verification.md',
      'https://github.com/waldoibarra/portfolio/blob/trunk/src/home/world.ts',
    ];
    for (const href of publicProof) {
      assert.equal(await page.locator('a[href]').evaluateAll((links, target) =>
        links.filter(link => link.href === target).length, href), 1);
    }
    for (const repo of ['pi-lens', 'dotfiles']) {
      const link = page.locator(`.workshop-proof a[href="https://github.com/waldoibarra/${repo}"]`);
      assert.equal(await link.count(), 1);
    }
    await page.goto(new URL('#crossroads-trading', origin).href);
    const guide = 'https://app.tradezella.com/shared/0bc6afe1/note/4b3475f1';
    assert.equal(await page.locator(`#crossroads-trading a[href="${guide}"]`).count(), 1);
    assert.equal(await page.locator('.journal-method ol li').count(), 3);
    await page.goto(new URL('#connect', origin).href);
    const icons = await page.locator('.connect li img').evaluateAll(images =>
      images.map(image => image.complete && image.naturalWidth > 0 && image.alt === ''));
    assert.deepEqual(icons, [true, true, true, true]);
    const atlasTopics = [
      'workshop-agents', 'workshop-review', 'workshop-sharing',
      'observatory-coherence', 'observatory-worldviews', 'observatory-inquiry',
      'garden-practice', 'garden-care', 'garden-balance',
      'crossroads-trading', 'crossroads-learning', 'crossroads-stories',
    ];
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(origin);
      for (const view of views) {
        await page.goto(new URL(`#${view}`, origin).href);
        const geometry = await page.locator(`#${view} .place-nav a, #${view} .domain-top a`)
          .evaluateAll(links => links.map(link => {
            const rect = link.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
          }));
        assert.ok(geometry.every(target => target.width >= 24 && target.height >= 24),
          `${view} navigation at ${width}px: ${JSON.stringify(geometry)}`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true, `${view} overflows at ${width}px`);
        if (process.env.WORLD_CAPTURE) {
          await page.screenshot({ path: `${process.env.WORLD_CAPTURE}/${view}-${width}.png` });
        }
      }
      for (const note of ['workshop-policy', 'workshop-verification', 'workshop-native',
        'workshop-delivery', 'observatory-evidence', 'observatory-learning-map',
        'garden-experiments', 'garden-attention', 'crossroads-decisions',
        'crossroads-perspectives']) {
        await page.goto(new URL(`#${note}`, origin).href);
        await expectDetail(page, note);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true, `${note} overflows at ${width}px`);
      }
      await page.goto(origin);
      for (const detail of atlasTopics) {
        const link = page.locator(`.atlas-directory a[href="#${detail}"]`);
        assert.equal(await link.count(), 1);
        await link.click();
        await expectView(page, detail.split('-')[0], `#${detail}`);
        assert.equal(await page.locator(`#${detail}`).evaluate(el => el.open), true);
        await expectDetail(page, detail);
        await page.locator(`#${detail.split('-')[0]} .domain-top a[href="#map"]`).click();
        await expectView(page, 'map');
        await expectTop(page, 'map');
      }
      await page.evaluate(() => {
        document.querySelector('#map a[href="#workshop-agents"]').click();
        document.querySelector('#map a[href="#garden-care"]').click();
        document.querySelector('#map a[href="#observatory-worldviews"]').click();
      });
      await expectView(page, 'observatory', '#observatory-worldviews');
      await expectDetail(page, 'observatory-worldviews');
      await page.goto(origin);
      await page.evaluate(() => {
        document.querySelector('#map .landmark[href="#workshop"]').click();
        document.querySelector('#workshop .domain-next a').click();
      });
      await expectView(page, 'observatory');
      assert.equal(await page.locator('#workshop .journal-plate').evaluate(el =>
        el.getAnimations().length), 0);
      await page.goto(new URL('#workshop', origin).href);
      const targets = await page.locator('#workshop .domain-top a').evaluateAll(links =>
        links.map(link => {
          const rect = link.getBoundingClientRect();
          return { label: link.textContent.trim(), width: rect.width, height: rect.height };
        }));
      assert.ok(targets.every(target => target.width >= 44 && target.height >= 44),
        `Navigation targets at ${width}px: ${JSON.stringify(targets)}`);
      assert.equal(await page.evaluate(() =>
        document.documentElement.scrollWidth <= window.innerWidth), true);
    }
    await page.goto(new URL('#workshop', origin).href);
    await page.reload();
    const restingTransform = await page.locator('#workshop .journal-plate')
      .evaluate(el => getComputedStyle(el).transform);
    await page.locator('#workshop .domain-top a[href="#map"]').click();
    await expectView(page, 'map');
    const arrival = await page.evaluate(async () => {
      const changed = new Promise(resolve =>
        window.addEventListener('hashchange', resolve, { once: true }));
      document.querySelector('#map .landmark[href="#workshop"]').click();
      await changed;
      const plate = document.querySelector('#workshop .journal-plate');
      const animation = plate.getAnimations()[0];
      const runningState = animation?.playState;
      window.testArrival = animation;
      if (animation) {
        animation.pause();
        animation.currentTime = 120;
      }
      return { state: runningState, transform: getComputedStyle(plate).transform };
    });
    assert.equal(arrival.state, 'running');
    assert.equal(arrival.transform, restingTransform, 'Arrival must preserve plate rotation');
    await page.locator('#workshop .domain-next a').click();
    await expectView(page, 'observatory');
    assert.equal(await page.evaluate(() => window.testArrival.playState), 'idle');
    assert.equal(await page.locator('#workshop .journal-plate')
      .evaluate(el => el.getAnimations().length), 0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(new URL('#garden', origin).href);
    assert.equal(await page.locator('.garden .journal-plate').evaluate(el =>
      el.getAnimations().length), 0);
    await page.locator('.garden .topic-nav a[href="#garden-care"]').click();
    await expectView(page, 'garden', '#garden-care');
    await expectDetail(page, 'garden-care');
    await page.locator('#garden .domain-top a[href="#map"]').click();
    await page.locator('#map .landmark[href="#workshop"]').click();
    await expectView(page, 'workshop');
    assert.equal(await page.locator('#workshop .journal-plate')
      .evaluate(el => el.getAnimations().length), 0);
    assert.deepEqual(errors, []);
    await context.close();

    const touch = await browser.newContext({ hasTouch: true, isMobile: true,
      viewport: { width: 390, height: 844 } });
    try {
      const mobile = await touch.newPage();
      await mobile.goto(origin);
      await mobile.getByLabel('Connections', { exact: true }).tap();
      assert.equal(await mobile.locator('.connection-index:visible').count(), 1);
      await mobile.locator('.connection-index a[href="#garden-balance"]').tap();
      await expectView(mobile, 'garden', '#garden-balance');
      await expectDetail(mobile, 'garden-balance');
      await mobile.locator('#garden .domain-top a[href="#map"]').tap();
      await expectView(mobile, 'map');
    } finally {
      await touch.close();
    }

    const noScript = await browser.newContext({
      javaScriptEnabled: false, reducedMotion: 'reduce',
    });
    try {
      const plain = await noScript.newPage();
      await plain.goto(origin);
      assert.equal(await plain.locator('[data-view]:visible').count(), views.length);
      assert.equal(await plain.locator('[data-lens-panel]:visible').count(), 2);
      assert.equal(await plain.locator('[data-lens-control]:visible').count(), 0);
      assert.equal(await plain.locator('[data-open-connections]:visible').count(), 0);
      assert.equal(await plain.locator('.connection-index a[href="#workshop-review"]').count(), 1);
      await plain.locator('.landmark[href="#workshop"]').click();
      assert.equal(new URL(plain.url()).hash, '#workshop');
      await plain.locator('#workshop-practice summary').click();
      assert.equal(await plain.locator('#workshop-practice').evaluate(el => el.open), true);
      assert.equal(await plain.locator('#workshop-policy summary').count(), 1);
      await plain.locator('#workshop-policy summary').click();
      assert.equal(await plain.locator('#workshop-policy').evaluate(el => el.open), true);
      await plain.locator('#observatory-inquiry summary').click();
      await plain.locator('#observatory-inquiry a[href="#observatory-learning-map"]').click();
      assert.equal(new URL(plain.url()).hash, '#observatory-learning-map');
      assert.equal(await plain.locator('#observatory-learning-map summary').count(), 1);
    } finally {
      await noScript.close();
    }
  } finally {
    await browser.close();
  }
});
