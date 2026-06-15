create index if not exists daily_quests_template_id_idx on public.daily_quests(template_id);

drop policy if exists "users read own daily runs" on public.daily_runs;
drop policy if exists "users insert own daily runs" on public.daily_runs;
drop policy if exists "users update own daily runs" on public.daily_runs;
drop policy if exists "users delete own daily runs" on public.daily_runs;
drop policy if exists "users read own daily quests" on public.daily_quests;
drop policy if exists "users insert own daily quests" on public.daily_quests;
drop policy if exists "users update own daily quests" on public.daily_quests;
drop policy if exists "users delete own daily quests" on public.daily_quests;
drop policy if exists "users read own daily reflections" on public.daily_reflections;
drop policy if exists "users insert own daily reflections" on public.daily_reflections;
drop policy if exists "users update own daily reflections" on public.daily_reflections;
drop policy if exists "users delete own daily reflections" on public.daily_reflections;

create policy "users read own daily runs"
  on public.daily_runs
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "users insert own daily runs"
  on public.daily_runs
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "users update own daily runs"
  on public.daily_runs
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users delete own daily runs"
  on public.daily_runs
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create policy "users read own daily quests"
  on public.daily_quests
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "users insert own daily quests"
  on public.daily_quests
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "users update own daily quests"
  on public.daily_quests
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users delete own daily quests"
  on public.daily_quests
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create policy "users read own daily reflections"
  on public.daily_reflections
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "users insert own daily reflections"
  on public.daily_reflections
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "users update own daily reflections"
  on public.daily_reflections
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users delete own daily reflections"
  on public.daily_reflections
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
