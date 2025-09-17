import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPageHtml } from './utils/site.mjs';

let homeHtml;

describe('Home page', () => {
  before(async () => {
    homeHtml = await getPageHtml('index.html');
  });

  it('renders hero headline with name', () => {
    assert.match(homeHtml, /Dave Andrea/i);
  });

  it('includes an introductory blog preview section', () => {
    assert.match(homeHtml, /From the blog/i);
  });

  it('includes contact section callout', () => {
    assert.match(homeHtml, /Get in touch/i);
  });
});
