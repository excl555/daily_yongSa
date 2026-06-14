# 하루 용사

현실의 작은 행동을 일일퀘스트로 바꾸고, 완료 기록을 캘린더와 회고로 쌓는 생활형 자기관리 웹 앱 프로토타입입니다. 현재 버전은 Next.js App Router, Supabase SSR Auth, 계정별 RLS 구조로 구성되어, 로그인한 사용자별로 퀘스트 기록과 회고를 분리합니다.

## 실행

```bash
npm install
npm run dev
```

로컬 환경 변수는 `.env.local`에 둡니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ouursaeboyuwkgyaztyt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Dy5xjoF75t8ULesupmRagQ_nR-ndTzH
```

## QA

```bash
npm test
npm run qa
```

`npm run qa`는 도메인 테스트, 정적 구조 smoke check, Next production build를 순서대로 실행합니다.

## Supabase

프로젝트:

- URL: `https://ouursaeboyuwkgyaztyt.supabase.co`
- 클라이언트 키: `sb_publishable_Dy5xjoF75t8ULesupmRagQ_nR-ndTzH`

DB 적용 순서:

1. `supabase/migrations/202606140001_daily_yongsa_schema.sql`
2. `supabase/migrations/20260614135841_add_auth_scoped_daily_data.sql`
3. `supabase/seed.sql`

CLI가 있는 환경:

```bash
supabase login
supabase init
supabase link --project-ref ouursaeboyuwkgyaztyt
supabase db push
supabase db execute --file supabase/seed.sql
```

DB 적용 전에도 로그인 UI와 로컬 예시 데이터 fallback은 동작합니다. DB 적용 후에는 로그인한 계정의 `auth.uid()` 기준으로 일일퀘스트, 월간 캘린더, 주간 타임라인, 회고가 분리됩니다.

## 인증

- `/login`에서 이메일/비밀번호로 로그인 또는 가입합니다.
- `/` 홈 화면은 로그인 필수이며, 미로그인 사용자는 `/login`으로 이동합니다.
- 사이드바의 로그아웃 버튼은 현재 브라우저 세션만 종료합니다.
- 새 계정은 첫 대시보드 진입 시 예시 월간 기록이 해당 `user_id` 소유 데이터로 생성됩니다.

## Vercel

Vercel Import에서 Framework Preset은 `Next.js`로 감지되도록 두면 됩니다. 환경 변수에는 아래 두 값을 등록합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

배포 전 확인:

```bash
npm run qa
```

## 현재 포함 기능

- 목표별 일일퀘스트
- 랜덤 다시 뽑기
- 완료 체크, EXP, 칭호, 스탯 상승
- 하루 회고
- 월간 캘린더
- 주간 타임라인
- Supabase SSR Auth
- 계정별 RLS 데이터 분리
- 로컬 seed fallback
