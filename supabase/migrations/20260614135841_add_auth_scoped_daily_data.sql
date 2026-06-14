alter table public.daily_runs
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.daily_quests
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.daily_reflections
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.daily_runs
  drop constraint if exists daily_runs_run_date_key;

alter table public.daily_quests
  drop constraint if exists daily_quests_run_date_sort_order_key;

alter table public.daily_reflections
  drop constraint if exists daily_reflections_run_date_key;

create unique index if not exists daily_runs_user_date_idx
  on public.daily_runs(user_id, run_date)
  where user_id is not null;

create unique index if not exists daily_quests_user_date_sort_idx
  on public.daily_quests(user_id, run_date, sort_order)
  where user_id is not null;

create unique index if not exists daily_reflections_user_date_idx
  on public.daily_reflections(user_id, run_date)
  where user_id is not null;

create index if not exists daily_runs_user_idx on public.daily_runs(user_id, run_date);
create index if not exists daily_quests_user_idx on public.daily_quests(user_id, run_date, sort_order);
create index if not exists daily_reflections_user_idx on public.daily_reflections(user_id, run_date);

drop policy if exists "demo read daily runs" on public.daily_runs;
drop policy if exists "demo read daily quests" on public.daily_quests;
drop policy if exists "demo read daily reflections" on public.daily_reflections;
drop policy if exists "demo update daily quests" on public.daily_quests;
drop policy if exists "demo upsert daily reflections" on public.daily_reflections;

create policy "users read own daily runs"
  on public.daily_runs
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "users insert own daily runs"
  on public.daily_runs
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users update own daily runs"
  on public.daily_runs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users delete own daily runs"
  on public.daily_runs
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "users read own daily quests"
  on public.daily_quests
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "users insert own daily quests"
  on public.daily_quests
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users update own daily quests"
  on public.daily_quests
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users delete own daily quests"
  on public.daily_quests
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "users read own daily reflections"
  on public.daily_reflections
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "users insert own daily reflections"
  on public.daily_reflections
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users update own daily reflections"
  on public.daily_reflections
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users delete own daily reflections"
  on public.daily_reflections
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.daily_runs to authenticated;
grant select, insert, update, delete on public.daily_quests to authenticated;
grant select, insert, update, delete on public.daily_reflections to authenticated;
