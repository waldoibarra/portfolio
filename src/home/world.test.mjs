import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { resolveFragment, views } from './world.ts';

const shell = readFileSync(new URL('index.html', import.meta.url), 'utf8');
const html = shell.replace(/<!-- include: (home\/notes\/[a-z-]+\.html) -->/g,
  (_, filename) => readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8'));

test('working notes remain reachable from their topics in initial HTML', () => {
  for (const [view, notes] of Object.entries({
    workshop: ['policy', 'verification', 'native', 'delivery'],
    observatory: ['evidence', 'learning-map'],
    garden: ['experiments', 'attention'],
    crossroads: ['decisions', 'perspectives'],
  })) {
    for (const note of notes) {
      const id = `${view}-${note}`;
      assert.match(html, new RegExp(`<details id="${id}"`));
      assert.match(html, new RegExp(`href="#${id}"`));
      assert.deepEqual(resolveFragment(`#${id}`, target => target === id ? view : null), {
        view, detail: id, invalid: false,
      });
    }
  }
  assert.doesNotMatch(html, /<!-- include:/);
});

test('every named view has an addressable panel and heading', () => {
  for (const view of views) {
    assert.match(html, new RegExp(`id="${view}"[^>]*data-view`));
    assert.match(html, new RegExp(`id="${view}-title"`));
    assert.deepEqual(resolveFragment(`#${view}`), { view, invalid: false });
  }
});

test('skip link, default map, and invalid fragments have distinct outcomes', () => {
  assert.match(html, /class="skip-link" href="#main"/);
  assert.deepEqual(resolveFragment(''), { view: 'map', invalid: false });
  assert.deepEqual(resolveFragment('#main'), { view: 'map', invalid: false });
  assert.deepEqual(resolveFragment('#unknown'), { view: 'map', invalid: true });
  assert.deepEqual(resolveFragment('#%E0%A4%A'), { view: 'map', invalid: true });
});

test('detail fragments resolve through their containing view', () => {
  const parent = id => id === 'garden-practice' ? 'garden' : null;
  assert.deepEqual(resolveFragment('#garden-practice', parent), {
    view: 'garden', detail: 'garden-practice', invalid: false,
  });
  assert.deepEqual(resolveFragment('#outside', () => 'unrecognized'), {
    view: 'map', invalid: true,
  });
});

test('embedded navigation and depth remain in the initial HTML', () => {
  assert.doesNotMatch(html, /<header|<footer|site-header|site-footer/);
  for (const view of views) {
    assert.match(html, new RegExp(`href="#${view}" data-location="${view}"`));
  }
  assert.match(html, /data-lens-panel="shelves"/);
  assert.match(html, /data-lens-panel="connections"/);
  assert.match(html, /Made with curiosity and care/);
  for (const view of views.slice(1, 5)) {
    assert.match(html, new RegExp(`href="#${view}"`));
    assert.match(html, new RegExp(`<details id="${view}-`));
  }
  assert.match(html, /href="#connect"/);
  assert.match(html, /<script type="module" src="\/home\/world.ts">\s*<\/script>/);
});
