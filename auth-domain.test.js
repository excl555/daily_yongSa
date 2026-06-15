import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAuthErrorMessage,
  getSiteUrl,
  validateCredentials,
  validateSignupCredentials
} from './lib/auth-domain.js';

describe('auth form rules', () => {
  it('requires matching password confirmation on signup', () => {
    const result = validateSignupCredentials({
      email: 'hero@example.com',
      password: 'secret123',
      passwordConfirm: 'secret124'
    });

    assert.equal(result.error, '비밀번호가 서로 일치하지 않습니다.');
  });

  it('accepts matching signup credentials', () => {
    const result = validateSignupCredentials({
      email: ' hero@example.com ',
      password: 'secret123',
      passwordConfirm: 'secret123'
    });

    assert.deepEqual(result, {
      email: 'hero@example.com',
      password: 'secret123',
      error: null
    });
  });

  it('explains email confirmation and email rate limit auth errors', () => {
    assert.equal(
      getAuthErrorMessage({ code: 'email_not_confirmed', message: 'Email not confirmed' }, 'signin'),
      '이메일 인증이 아직 완료되지 않았습니다. 메일함에서 인증 링크를 먼저 눌러주세요.'
    );
    assert.equal(
      getAuthErrorMessage(
        {
          code: 'over_email_send_rate_limit',
          message: 'For security purposes, you can only request this after 54 seconds.'
        },
        'signup'
      ),
      '인증 메일을 너무 자주 요청했습니다. 잠시 뒤 다시 시도하거나 이미 받은 메일함을 확인해주세요.'
    );
  });

  it('builds a normalized site url for auth redirects', () => {
    assert.equal(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://daily-yong-sa.vercel.app' }), 'https://daily-yong-sa.vercel.app');
    assert.equal(getSiteUrl({ VERCEL_URL: 'preview.vercel.app' }), 'https://preview.vercel.app');
    assert.equal(getSiteUrl({}), 'http://localhost:3000');
  });

  it('keeps login validation shared with signup', () => {
    const result = validateCredentials({ email: '', password: '' });

    assert.equal(result.error, '이메일과 비밀번호를 모두 입력해주세요.');
  });
});
