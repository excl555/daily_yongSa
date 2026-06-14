# 하루 용사 배포/DB 적용 메모

Supabase CLI가 설치된 환경에서는 아래 순서로 적용합니다.

```bash
supabase login
supabase init
supabase link --project-ref ouursaeboyuwkgyaztyt
supabase db push
supabase db execute --file supabase/seed.sql
```

현재 로컬 환경에는 Supabase CLI가 없어 직접 적용하지 못했습니다. 대안으로 Supabase Dashboard의 SQL Editor에서 아래 파일을 순서대로 실행해도 됩니다.

1. `supabase/migrations/202606140001_daily_yongsa_schema.sql`
2. `supabase/seed.sql`

이 앱은 DB 적용 전에도 로컬 예시 데이터로 렌더링됩니다. DB 적용 후에는 브라우저에서 Supabase REST API를 읽어 실제 seed 데이터를 사용합니다.
