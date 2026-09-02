-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  source text default 'map-for-success-landing',
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Không có policy nào cho anon/authenticated: bảng chỉ truy cập được qua
-- service-role / secret key (server-side), đúng với cách route.ts đang dùng.
