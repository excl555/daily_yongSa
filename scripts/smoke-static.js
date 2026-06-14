const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

[
  'data-quests',
  'data-randomize',
  'data-month-calendar',
  'data-week-history',
  'data-data-source'
].forEach((hook) => assert.ok(html.includes(hook), `missing hook: ${hook}`));

assert.ok(js.includes('https://ouursaeboyuwkgyaztyt.supabase.co'), 'missing Supabase URL');
assert.ok(js.includes('sb_publishable_'), 'missing Supabase publishable key');
assert.ok(css.includes('.month-calendar'), 'missing calendar styles');
assert.ok(css.includes('.week-entry'), 'missing weekly history styles');

console.log('static smoke check passed');
