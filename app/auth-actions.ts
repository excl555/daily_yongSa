'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

function getCredentials(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { email, password, error: '이메일과 비밀번호를 모두 입력해주세요.' };
  }

  if (password.length < 6) {
    return { email, password, error: '비밀번호는 최소 6자 이상이어야 합니다.' };
  }

  return { email, password, error: null };
}

export async function signIn(formData: FormData) {
  const { email, password, error: validationError } = getCredentials(formData);
  if (validationError) redirect(`/login?message=${encodeURIComponent(validationError)}`);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?message=${encodeURIComponent('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')}`);
  }

  redirect('/');
}

export async function signUp(formData: FormData) {
  const { email, password, error: validationError } = getCredentials(formData);
  if (validationError) redirect(`/login?message=${encodeURIComponent(validationError)}`);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?message=${encodeURIComponent('가입에 실패했습니다. 이미 가입된 이메일일 수 있습니다.')}`);
  }

  redirect(`/login?message=${encodeURIComponent('가입 요청이 완료되었습니다. 이메일 확인이 필요하면 메일함을 확인한 뒤 로그인해주세요.')}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login');
}
