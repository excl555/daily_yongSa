import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = [
  'app/page.tsx',
  'app/login/page.tsx',
  'app/signup/page.tsx',
  'app/auth/callback/route.ts',
  'app/auth/confirm/route.ts',
  'app/auth-actions.ts',
  'app/dashboard-actions.ts',
  'app/daily-yongsa-app.tsx',
  'app/globals.css',
  'lib/quest-domain.js',
  'lib/supabase-dashboard.ts',
  'utils/supabase/client.ts',
  'utils/supabase/server.ts',
  'utils/supabase/middleware.ts',
  'proxy.ts'
];

files.forEach((file) => {
  assert.ok(fs.existsSync(path.join(root, file)), `missing file: ${file}`);
});

const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app/daily-yongsa-app.tsx'), 'utf8');
const auth = fs.readFileSync(path.join(root, 'app/auth-actions.ts'), 'utf8');
const login = fs.readFileSync(path.join(root, 'app/login/page.tsx'), 'utf8');
const signup = fs.readFileSync(path.join(root, 'app/signup/page.tsx'), 'utf8');
const authCallback = fs.readFileSync(path.join(root, 'app/auth/callback/route.ts'), 'utf8');
const authConfirm = fs.readFileSync(path.join(root, 'app/auth/confirm/route.ts'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'lib/supabase-dashboard.ts'), 'utf8');

[
  'DailyYongsaApp',
  'getDashboardState'
].forEach((hook) => assert.ok(page.includes(hook), `missing page hook: ${hook}`));

[
  'data-quests',
  'data-month-calendar',
  'data-week-history',
  'data-view="quests"',
  'data-view="reflection"',
  'data-view="growth"',
  'data-booster',
  'data-reflection-prompts',
  'data-growth-report',
  '오늘의 퀘스트',
  '하루 회고',
  '성장 리포트'
].forEach((hook) => assert.ok(app.includes(hook), `missing app hook: ${hook}`));

assert.ok(auth.includes('signInWithPassword'), 'missing Supabase password sign in');
assert.ok(auth.includes('AUTH_MESSAGE_COOKIE'), 'missing auth flash cookie');
assert.ok(!auth.includes('/login?message='), 'auth actions should not leak messages in URLs');
assert.ok(auth.includes('validateSignupCredentials'), 'missing signup password confirmation validation');
assert.ok(auth.includes('emailRedirectTo'), 'missing email confirmation redirect');
assert.ok(auth.includes('getAuthCallbackUrl'), 'missing auth callback redirect URL');
assert.ok(auth.includes('isExistingSignup'), 'missing existing signup guard');
assert.ok(auth.includes('signOut'), 'missing Supabase sign out');
assert.ok(login.includes('href="/signup"'), 'missing sign up route link');
assert.ok(login.includes('로그인'), 'missing Korean login page copy');
assert.ok(signup.includes('계정 만들기'), 'missing sign up page submit UI');
assert.ok(signup.includes('name="passwordConfirm"'), 'missing password confirmation input');
assert.ok(authCallback.includes('exchangeCodeForSession'), 'missing Supabase auth callback code exchange');
assert.ok(authConfirm.includes('verifyOtp'), 'missing auth confirmation token exchange');
assert.ok(dashboard.includes("from('quest_templates')"), 'missing Supabase quest template query');
assert.ok(dashboard.includes('ensureUserSeedData'), 'missing account seed setup');
assert.ok(dashboard.includes('createInitialState()'), 'missing local seed fallback');
assert.ok(css.includes('.month-calendar'), 'missing calendar styles');
assert.ok(css.includes('.week-entry'), 'missing weekly history styles');
assert.ok(css.includes('.auth-page'), 'missing auth page styles');
assert.ok(css.includes('.auth-link-button'), 'missing auth link button styles');

console.log('Next smoke check passed');
