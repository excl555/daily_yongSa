'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { AUTH_MESSAGE_COOKIE } from '@/app/auth-message';
import {
  getAuthErrorMessage,
  getAuthCallbackUrl,
  isExistingSignup,
  validateCredentials,
  validateSignupCredentials
} from '@/lib/auth-domain';

async function setAuthMessage(message: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_MESSAGE_COOKIE, message, {
    httpOnly: true,
    maxAge: 60,
    path: '/',
    sameSite: 'lax'
  });
}

export async function signIn(formData: FormData) {
  const { email, password, error: validationError } = validateCredentials({
    email: formData.get('email'),
    password: formData.get('password')
  });
  if (validationError) {
    await setAuthMessage(validationError);
    redirect('/login');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await setAuthMessage(getAuthErrorMessage(error, 'signin'));
    redirect('/login');
  }

  redirect('/');
}

export async function signUp(formData: FormData) {
  const { email, password, error: validationError } = validateSignupCredentials({
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm')
  });
  if (validationError) {
    await setAuthMessage(validationError);
    redirect('/signup');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl()
    }
  });

  if (error) {
    await setAuthMessage(getAuthErrorMessage(error, 'signup'));
    redirect('/signup');
  }

  if (isExistingSignup(data)) {
    await setAuthMessage('이미 가입된 이메일입니다. 로그인해주세요.');
    redirect('/login');
  }

  await setAuthMessage('가입 요청이 완료되었습니다. 메일함의 인증 링크를 누른 뒤 로그인해주세요.');
  redirect('/login');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login');
}
