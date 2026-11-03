create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: nobody can touch a row unless the policy allows it.
alter table public.user_state enable row level security;

-- Each signed-in user can only see and change THEIR OWN row.
create policy "Users read own state"   on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own state" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own state" on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own state" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);

-- Anonymous (not signed in) visitors get no policy, so they can read and write nothing.
