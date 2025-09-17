import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPageHtml } from './utils/site.mjs';

let html;

describe('Contact section', () => {
  before(async () => {
    html = await getPageHtml('index.html');
  });

  it('defines the contact endpoint on the section wrapper', () => {
    assert.match(html, /<section[^>]+id="contact"[^>]+data-endpoint="https:\/\/astro-contact-worker\.your-domain\.workers\.dev\/api\/contact"/);
  });

  it('includes the interactive email toggle button', () => {
    assert.match(html, /<button[^>]+data-email-link[^>]+aria-controls="contact-form-wrapper"[^>]*>/i);
  });

  it('ships the Turnstile captcha element and counter UI', () => {
    assert.match(html, /id="cf-turnstile"/);
    assert.match(html, /id="char-counter"/);
  });

  it('lazy-initialises form logic using requestIdleCallback fallback', () => {
    assert.match(html, /requestIdleCallback/);
    assert.match(html, /setTimeout\(\(\) => ensureInit\(\), 1000\)/);
  });
});
