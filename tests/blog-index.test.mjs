import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPageHtml } from './utils/site.mjs';

let blogHtml;

describe('Blog index page', () => {
  before(async () => {
    blogHtml = await getPageHtml('blog/index.html');
  });

  it('exposes a search form for posts', () => {
    assert.match(blogHtml, /<input[^>]+name="q"/i);
  });

  it('summarises visible results', () => {
    assert.match(blogHtml, /data-results-count[^>]*>[^<]*Showing/i);
  });

  it('lists at least one blog card', () => {
    assert.match(blogHtml, /href="\/?blog\//i);
  });
});
