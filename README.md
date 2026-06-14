# 하루 용사

현실의 작은 행동을 일일퀘스트로 바꾸고, 완료 기록을 캘린더와 회고로 쌓는 생활형 자기관리 웹 앱 프로토타입입니다. 현재 버전은 Next.js App Router와 Supabase SSR 구조로 구성되어, DB가 준비되면 서버에서 seed 데이터를 읽고 DB가 비어 있어도 예시 데이터로 화면을 유지합니다.

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
2. `supabase/seed.sql`

CLI가 있는 환경:

```bash
supabase login
supabase init
supabase link --project-ref ouursaeboyuwkgyaztyt
supabase db push
supabase db execute --file supabase/seed.sql
```

DB 적용 전에도 로컬 예시 데이터로 화면이 보입니다. DB 적용 후에는 서버 컴포넌트에서 Supabase 데이터를 읽어 일일퀘스트, 월간 캘린더, 주간 타임라인을 구성합니다.

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
- Supabase SSR 연동 및 로컬 seed fallback
