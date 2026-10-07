const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '../src/renderer.js'), 'utf8');
function setup(saved = {}) {
  const dom = new JSDOM(html, { url: 'https://companion.local/', runScripts: 'outside-only' });
  const copies = []; const pins = [];
  dom.window.companion = { copy: async text => copies.push(text), pin: async value => pins.push(value) };
  dom.window.confirm = () => true;
  for (const [key, value] of Object.entries(saved)) dom.window.localStorage.setItem(key, value);
  dom.window.eval(script);
  return { dom, window: dom.window, $: id => dom.window.document.getElementById(id), copies, pins };
}
test('actions append to an existing prompt and copying preserves the combined text', async () => {
  const { dom, window, $, copies } = setup();
  try {
    $('draft').value = 'My original prompt';
    $('actions').querySelector('button').click();
    $('actions').querySelectorAll('button')[1].click();
    const expected = 'My original prompt\n\nExplain how this works.\n\nReview this and suggest improvements.';
    assert.equal($('draft').value, expected);
    assert.equal(window.localStorage.getItem('draft'), expected);
    $('copy').click(); await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(copies, [expected]);
    assert.match($('status').textContent, /Copied/);
  } finally { dom.window.close(); }
});
test('custom button text stays literal, persists, and can be removed', () => {
  const { dom, window, $ } = setup();
  try {
    $('edit').click(); $('label').value = '<img src=x>'; $('text').value = 'Custom instruction';
    $('editor').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal($('actions').querySelector('img'), null);
    const groups = $('actions').querySelectorAll('.action');
    groups[3].querySelector('button').click();
    assert.equal($('draft').value, 'Custom instruction');
    assert.equal(JSON.parse(window.localStorage.getItem('actions'))[3].label, '<img src=x>');
    groups[3].querySelector('.remove').click();
    assert.equal(JSON.parse(window.localStorage.getItem('actions')).length, 3);
  } finally { dom.window.close(); }
});
test('saved state restores and pinning calls the desktop bridge', async () => {
  const { dom, window, $, pins } = setup({ draft: 'Saved prompt', actions: JSON.stringify([{ label: 'Mine', text: 'My action' }]) });
  try {
    assert.equal($('draft').value, 'Saved prompt');
    assert.equal($('actions').querySelector('button').textContent, 'Mine');
    $('pin').checked = true; $('pin').dispatchEvent(new window.Event('change'));
    await new Promise(resolve => setImmediate(resolve)); assert.deepEqual(pins, [true]);
    $('clear').click(); assert.equal(window.localStorage.getItem('draft'), '');
  } finally { dom.window.close(); }
});
test('empty drafts are not copied and clipboard errors are visible', async () => {
  const { dom, window, $, copies } = setup();
  try {
    $('copy').click(); assert.deepEqual(copies, []); assert.match($('status').textContent, /first/);
    window.companion.copy = async () => { throw new Error('unavailable'); };
    $('draft').value = 'Preserve me'; $('copy').click(); await new Promise(resolve => setImmediate(resolve));
    assert.match($('status').textContent, /Copy failed/); assert.equal($('draft').value, 'Preserve me');
  } finally { dom.window.close(); }
});
