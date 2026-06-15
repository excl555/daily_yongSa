export function validateCredentials({ email, password }) {
  const normalizedEmail = String(email || '').trim();
  const normalizedPassword = String(password || '');

  if (!normalizedEmail || !normalizedPassword) {
    return {
      email: normalizedEmail,
      password: normalizedPassword,
      error: '이메일과 비밀번호를 모두 입력해주세요.'
    };
  }

  if (normalizedPassword.length < 6) {
    return {
      email: normalizedEmail,
      password: normalizedPassword,
      error: '비밀번호는 최소 6자 이상이어야 합니다.'
    };
  }

  return { email: normalizedEmail, password: normalizedPassword, error: null };
}

export function validateSignupCredentials({ email, password, passwordConfirm }) {
  const result = validateCredentials({ email, password });
  const normalizedPasswordConfirm = String(passwordConfirm || '');

  if (result.error) return result;

  if (!normalizedPasswordConfirm) {
    return { ...result, error: '비밀번호 확인을 입력해주세요.' };
  }

  if (result.password !== normalizedPasswordConfirm) {
    return { ...result, error: '비밀번호가 서로 일치하지 않습니다.' };
  }

  return result;
}

export function getAuthErrorMessage(error, intent) {
  const code = String(error?.code || '');
  const message = String(error?.message || '');

  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
    return '이메일 인증이 아직 완료되지 않았습니다. 메일함에서 인증 링크를 먼저 눌러주세요.';
  }

  if (code === 'over_email_send_rate_limit' || /rate limit|only request this after/i.test(message)) {
    return '인증 메일을 너무 자주 요청했습니다. 잠시 뒤 다시 시도하거나 이미 받은 메일함을 확인해주세요.';
  }

  if (code === 'user_already_exists' || /already registered|already exists/i.test(message)) {
    return '이미 가입된 이메일입니다. 로그인하거나 받은 인증 메일을 확인해주세요.';
  }

  if (intent === 'signin') {
    return '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
  }

  return '가입에 실패했습니다. 입력한 이메일과 비밀번호를 다시 확인해주세요.';
}

export function getSiteUrl(env = process.env) {
  let url = env.NEXT_PUBLIC_SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL || 'http://localhost:3000';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url.replace(/\/+$/, '');
}
