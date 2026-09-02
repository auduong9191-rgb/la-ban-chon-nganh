-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Mở rộng bảng `leads` để thành checkout/order (form đăng ký giờ = tạo đơn hàng chờ thanh toán Sepay)

alter table public.leads
  add column if not exists order_id text unique,
  add column if not exists product_name text,
  add column if not exists amount integer,
  add column if not exists status text not null default 'pending',
  add column if not exists paid_at timestamptz,
  add column if not exists payment_reference_code text,
  add column if not exists payment_gateway text;

-- Dedup theo Sepay transaction id (integer) — insert-or-ignore để chống webhook retry
create table if not exists public.sepay_webhook_events (
  id bigint primary key,
  received_at timestamptz not null default now()
);

alter table public.sepay_webhook_events enable row level security;
