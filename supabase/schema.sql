-- CoreQueen logs table (no auth; use user_id for future segmentation)
create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id text not null default 'default',
  exercise_data jsonb not null default '[]',
  notes text,
  feeling text
);

create index if not exists idx_logs_created_at on public.logs (created_at desc);
create index if not exists idx_logs_user_id on public.logs (user_id);

alter table public.logs enable row level security;

create policy "Allow all for logs"
  on public.logs for all
  using (true)
  with check (true);
