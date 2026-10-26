import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { resolveFragment, views } from './world.ts';

const html = readFileSync(new URL('index.html', import.meta.url), 'utf8');

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

test('depth and navigation remain in the initial HTML', () => {
  for (const view of views.slice(1, 5)) {
    assert.match(html, new RegExp(`href="#${view}"`));
    assert.match(html, new RegExp(`<details id="${view}-`));
  }
  assert.match(html, /href="#connect"/);
  assert.match(html, /<script type="module" src="\/home\/world.ts">\s*<\/script>/);
});
