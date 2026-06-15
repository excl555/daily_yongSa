import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { AUTH_MESSAGE_COOKIE } from '@/app/auth-message';
import { createClient } from '@/utils/supabase/server';

async function setAuthMessage(message: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_MESSAGE_COOKIE, message, {
    httpOnly: true,
    maxAge: 60,
    path: '/',
    sameSite: 'lax'
  });
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      await setAuthMessage('이메일 인증이 완료되었습니다. 하루 용사를 시작해볼까요.');
      redirect('/');
    }
  }

  await setAuthMessage('인증 링크가 만료되었거나 올바르지 않습니다. 새 인증 메일을 다시 요청해주세요.');
  redirect('/login');
}
