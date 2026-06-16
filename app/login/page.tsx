import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { signIn } from '@/app/auth-actions';
import { AUTH_MESSAGE_COOKIE } from '@/app/auth-message';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) redirect('/');

  const message = (await cookies()).get(AUTH_MESSAGE_COOKIE)?.value;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">하</span>
          <div>
            <strong>하루 용사</strong>
            <p>계정별 퀘스트 기록을 안전하게 분리합니다.</p>
          </div>
        </div>

        <div className="auth-copy">
          <span className="kicker">Account</span>
          <h1>로그인</h1>
          <p>이메일 계정으로 접속하면 일일 퀘스트, 캘린더 기록, 진행 상태가 사용자별로 저장됩니다.</p>
        </div>

        {message ? <p className="auth-message">{message}</p> : null}

        <form className="auth-form">
          <label>
            이메일
            <input name="email" type="email" autoComplete="email" placeholder="okh8522@gmail.com" required />
          </label>
          <label>
            비밀번호
            <input name="password" type="password" autoComplete="current-password" minLength={6} placeholder="6자 이상" required />
          </label>
          <div className="auth-actions">
            <button formAction={signIn} type="submit">
              로그인
            </button>
            <Link href="/signup" className="auth-link-button">
              새 계정 만들기
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
