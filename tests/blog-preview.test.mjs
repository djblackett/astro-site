import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPageHtml } from './utils/site.mjs';

let homeHtml;

describe('Home blog preview cards', () => {
  before(async () => {
    homeHtml = await getPageHtml('index.html');
  });

  it('renders three preview cards with reading time badges', () => {
    const cards = homeHtml.match(/class="card bg-base-200 hover:bg-base-300 transition-colors"/g) ?? [];
    assert.equal(cards.length, 3);
    const readingTimeMatches = homeHtml.match(/aria-label="Estimated reading time">\d+ min read</g) ?? [];
    assert.equal(readingTimeMatches.length, 3);
  });

  it('links each preview to its full post', () => {
    assert.match(homeHtml, /href="\/blog\/ai-and-tacit-knowledge"/);
    assert.match(homeHtml, /href="\/blog\/welcome"/);
  });
});
