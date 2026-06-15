import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { signUp } from '@/app/auth-actions';
import { AUTH_MESSAGE_COOKIE } from '@/app/auth-message';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SignupPage() {
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
          <span className="brand-mark">勇</span>
          <div>
            <strong>하루 용사</strong>
            <p>새 계정을 만들고 나만의 퀘스트 기록을 시작합니다.</p>
          </div>
        </div>

        <div className="auth-copy">
          <span className="kicker">Account</span>
          <h1>새 계정 만들기</h1>
          <p>이메일과 비밀번호를 입력하면 계정별 캘린더와 회고 기록이 분리되어 저장됩니다.</p>
        </div>

        {message ? <p className="auth-message">{message}</p> : null}

        <form className="auth-form">
          <label>
            이메일
            <input name="email" type="email" autoComplete="email" placeholder="hero@example.com" required />
          </label>
          <label>
            비밀번호
            <input name="password" type="password" autoComplete="new-password" minLength={6} placeholder="6자 이상" required />
          </label>
          <div className="auth-actions">
            <button formAction={signUp} type="submit">
              계정 만들기
            </button>
            <Link href="/login" className="auth-link-button">
              로그인으로 돌아가기
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
