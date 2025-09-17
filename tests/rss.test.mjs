import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPageHtml } from './utils/site.mjs';

let rss;

describe('RSS feed', () => {
  before(async () => {
    rss = await getPageHtml('rss.xml');
  });

  it('declares the expected channel metadata', () => {
    assert.match(rss, /<title>Astro Blog RSS<\/title>/);
    assert.match(rss, /<link>http:\/\/localhost:4321\/<\/link>/);
  });

  it('includes every published blog post with permalink guid', () => {
    const items = rss.match(/<item>/g) ?? [];
    assert.equal(items.length, 3);
    assert.match(rss, /guid isPermaLink="true">http:\/\/localhost:4321\/blog\/ai-and-tacit-knowledge<\/guid>/);
  });

  it('serialises descriptions to avoid empty nodes', () => {
    assert.doesNotMatch(rss, /<description>\s*<\/description>/);
  });
});
