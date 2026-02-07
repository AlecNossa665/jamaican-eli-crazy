-- Table to store submitted names from the landing page.
-- Run this in Supabase Dashboard → SQL Editor, or via Supabase CLI.

create table if not exists public.names (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Allow anonymous inserts (e.g. from landing page). Tighten RLS as needed.
alter table public.names enable row level security;

create policy "Allow anonymous insert"
  on public.names
  for insert
  to anon
  with check (true);

-- Optional: allow read for authenticated users only (or anon if you want)
-- create policy "Allow read for authenticated"
--   on public.names for select to authenticated using (true);
