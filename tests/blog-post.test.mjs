import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPageHtml } from './utils/site.mjs';

let postHtml;

const slugPath = 'blog/ai-and-tacit-knowledge/index.html';

describe('Blog detail page', () => {
  before(async () => {
    postHtml = await getPageHtml(slugPath);
  });

  it('renders the post title in a heading', () => {
    assert.match(postHtml, /<h1[^>]*>[^<]*AI and Tacit Knowledge/i);
  });

  it('includes share controls for the post', () => {
    assert.match(postHtml, /Copy Link/);
    assert.match(postHtml, /Twitter/);
    assert.match(postHtml, /LinkedIn/);
  });

  it('advertises estimated reading time', () => {
    assert.match(postHtml, /min read/);
  });
});
