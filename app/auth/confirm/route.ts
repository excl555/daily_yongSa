import { type EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { AUTH_MESSAGE_COOKIE } from '@/app/auth-message';
import { createClient } from '@/utils/supabase/server';

function getSafeNext(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next');
  if (!next) return '/';

  const target = new URL(next, request.nextUrl.origin);
  if (target.origin !== request.nextUrl.origin) return '/';

  return `${target.pathname}${target.search}${target.hash}`;
}

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
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    });

    if (!error) {
      redirect(getSafeNext(request));
    }
  }

  await setAuthMessage('인증 링크가 만료되었거나 올바르지 않습니다. 다시 가입하거나 새 인증 메일을 요청해주세요.');
  redirect('/login');
}
