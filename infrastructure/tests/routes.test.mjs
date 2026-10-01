import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../functions/routes.js', import.meta.url), 'utf8');
const handler = runInNewContext(`${source}\nhandler;`);

function requestFor(uri) {
  return {
    uri,
    method: 'GET',
    querystring: { source: { value: 'portfolio' } },
    headers: { host: { value: 'waldo.love' } },
    cookies: {},
  };
}

test('rewrites /resume without redirecting or changing request metadata', () => {
  const request = requestFor('/resume');
  const expected = { ...request, uri: '/resume/index.html' };

  assert.deepEqual(handler({ request }), expected);
});

test('leaves the root, assets, direct objects, and unknown routes untouched', () => {
  for (const uri of [
    '/',
    '/home/index.html',
    '/resume/index.html',
    '/assets/home.css',
    '/resume/photo.jpg',
    '/resume/',
    '/Resume',
    '/resume-other',
    '/unknown',
    '/unknown/nested',
  ]) {
    const request = requestFor(uri);
    const expected = structuredClone(request);

    assert.deepEqual(handler({ request }), expected, uri);
  }
});
