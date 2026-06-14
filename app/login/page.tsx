import { redirect } from 'next/navigation';
import { signIn, signUp } from '@/app/auth-actions';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) redirect('/');

  const { message } = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">勇</span>
          <div>
            <strong>하루 용사</strong>
            <p>계정별 퀘스트 기록을 안전하게 분리합니다.</p>
          </div>
        </div>

        <div className="auth-copy">
          <span className="kicker">Account</span>
          <h1>로그인</h1>
          <p>이메일 계정으로 접속하면 일일퀘스트, 회고, 캘린더 기록이 사용자별로 저장됩니다.</p>
        </div>

        {message ? <p className="auth-message">{message}</p> : null}

        <form className="auth-form">
          <label>
            이메일
            <input name="email" type="email" autoComplete="email" placeholder="hero@example.com" required />
          </label>
          <label>
            비밀번호
            <input name="password" type="password" autoComplete="current-password" minLength={6} placeholder="6자 이상" required />
          </label>
          <div className="auth-actions">
            <button formAction={signIn} type="submit">
              로그인
            </button>
            <button formAction={signUp} type="submit" className="secondary-button">
              새 계정 만들기
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
