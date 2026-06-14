create extension if not exists "pgcrypto";

create table if not exists public.quest_templates (
  id uuid primary key default gen_random_uuid(),
  goal_id text not null check (goal_id in ('health', 'study', 'home', 'relation', 'mind')),
  title text not null,
  description text not null,
  stat text not null,
  exp integer not null check (exp > 0),
  difficulty text not null check (difficulty in ('Easy', 'Normal', 'Hard', 'Hidden')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null unique,
  user_label text not null default 'demo_user',
  selected_goal text not null check (selected_goal in ('health', 'study', 'home', 'relation', 'mind')),
  focus text not null,
  title text not null default '오늘의 퀘스트',
  created_at timestamptz not null default now()
);

create table if not exists public.daily_quests (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.daily_runs(id) on delete cascade,
  run_date date not null,
  template_id uuid references public.quest_templates(id) on delete set null,
  goal_id text not null,
  title text not null,
  description text not null,
  stat text not null,
  exp integer not null check (exp >= 0),
  difficulty text not null,
  completed boolean not null default false,
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (run_date, sort_order)
);

create table if not exists public.daily_reflections (
  id uuid primary key default gen_random_uuid(),
  run_date date not null unique,
  user_label text not null default 'demo_user',
  content text not null,
  mood text not null default 'calm',
  created_at timestamptz not null default now()
);

create index if not exists quest_templates_goal_idx on public.quest_templates(goal_id, sort_order);
create index if not exists daily_quests_run_date_idx on public.daily_quests(run_date, sort_order);
create index if not exists daily_quests_run_id_idx on public.daily_quests(run_id);

alter table public.quest_templates enable row level security;
alter table public.daily_runs enable row level security;
alter table public.daily_quests enable row level security;
alter table public.daily_reflections enable row level security;

drop policy if exists "demo read quest templates" on public.quest_templates;
drop policy if exists "demo read daily runs" on public.daily_runs;
drop policy if exists "demo read daily quests" on public.daily_quests;
drop policy if exists "demo read daily reflections" on public.daily_reflections;
drop policy if exists "demo update daily quests" on public.daily_quests;
drop policy if exists "demo upsert daily reflections" on public.daily_reflections;

create policy "demo read quest templates"
  on public.quest_templates
  for select
  to anon, authenticated
  using (active = true);

create policy "demo read daily runs"
  on public.daily_runs
  for select
  to anon, authenticated
  using (user_label = 'demo_user');

create policy "demo read daily quests"
  on public.daily_quests
  for select
  to anon, authenticated
  using (true);

create policy "demo read daily reflections"
  on public.daily_reflections
  for select
  to anon, authenticated
  using (user_label = 'demo_user');

create policy "demo update daily quests"
  on public.daily_quests
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "demo upsert daily reflections"
  on public.daily_reflections
  for all
  to anon, authenticated
  using (user_label = 'demo_user')
  with check (user_label = 'demo_user');

grant usage on schema public to anon, authenticated;
grant select on public.quest_templates to anon, authenticated;
grant select on public.daily_runs to anon, authenticated;
grant select, update on public.daily_quests to anon, authenticated;
grant select, insert, update on public.daily_reflections to anon, authenticated;
