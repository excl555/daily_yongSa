# 하루 용사

현실의 작은 행동을 일일퀘스트로 바꾸고, 완료 기록을 캘린더와 회고로 쌓는 생활형 자기관리 웹 앱 프로토타입입니다.

## 실행

정적 웹 앱이므로 `index.html`을 직접 열어도 동작합니다.

```bash
npm test
npm run qa
```

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

DB 적용 전에도 로컬 예시 데이터로 화면이 보입니다. DB 적용 후에는 브라우저에서 Supabase REST API를 읽어 seed 데이터를 사용합니다.

## Vercel

Vercel Import에서 Framework Preset은 `Other`를 사용하면 됩니다.

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
- Supabase REST 연동 및 로컬 seed fallback
