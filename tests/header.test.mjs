import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPageHtml } from './utils/site.mjs';

let html;

describe('Site header', () => {
  before(async () => {
    html = await getPageHtml('index.html');
  });

  it('links to major sections', () => {
    assert.match(html, /<a[^>]+href="\/?#about"[^>]*>About<\/a>/i);
    assert.match(html, /<a[^>]+href="\/blog"[^>]*>Blog<\/a>/i);
    assert.match(html, /<a[^>]+href="\/?#contact"[^>]*>Contact<\/a>/i);
  });

  it('exposes theme radio inputs for multiple appearances', () => {
    const matches = html.match(/name="theme-dropdown"/g) ?? [];
    assert.ok(matches.length >= 5, 'expected at least five theme radio inputs');
    assert.match(html, /input[^>]+value="dark"/i);
  });

  it('keeps header sticky with backdrop blur for readability', () => {
    assert.match(html, /<header[^>]+class="[^"]*sticky top-0[^"]*backdrop-blur/i);
  });
});
