import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPageHtml } from './utils/site.mjs';

let indexRedirect;
let authorRedirect;

describe('Author redirects', () => {
  before(async () => {
    indexRedirect = await getPageHtml('authors/index.html');
    authorRedirect = await getPageHtml('authors/djblackett/index.html');
  });

  it('redirects /authors to /blog with meta refresh', () => {
    assert.match(indexRedirect, /http-equiv="refresh" content="2;url=\/blog"/i);
    assert.match(indexRedirect, /<a href="\/blog">/i);
  });

  it('redirects /authors/djblackett to /blog with canonical pointing at blog', () => {
    assert.match(authorRedirect, /http-equiv="refresh" content="2;url=\/blog"/i);
    assert.match(authorRedirect, /<link rel="canonical" href="http:\/\/localhost:4321\/blog"/i);
  });
});
