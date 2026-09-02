-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Theo dõi CTV giới thiệu khách + tính hoa hồng theo nhóm + đánh dấu hoàn tiền.
-- Nhóm '1': chỉ giới thiệu làm GT (test VAKAD) — hoa hồng cố định/đơn trả phí.
-- Nhóm '2': giới thiệu + tự xuất Career Map (Gem 2 ngoài hệ thống) — hoa hồng cao hơn.

create table if not exists public.ctv (
  id uuid primary key default gen_random_uuid(),
  ctv_code text not null unique,
  name text not null,
  email text not null,
  group_type text not null default '1', -- '1' = chỉ GT, '2' = GT + xuất Career Map
  commission_amount integer not null default 0, -- VND/đơn trả phí
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.ctv enable row level security;
-- Không có policy cho anon/authenticated — chỉ truy cập qua service-role (trang /admin).

-- Không đặt foreign key ràng buộc ctv_code trên quiz_leads/leads: mã có thể gõ
-- sai hoặc CTV bị xoá sau này — không được để lỗi tra cứu CTV làm hỏng luồng
-- nộp bài test/thanh toán chính của khách. Tra cứu CTV luôn là "best effort" ở
-- tầng ứng dụng (xem lib/ctv.ts), không phải ràng buộc DB.
alter table public.quiz_leads
  add column if not exists ctv_code text;

alter table public.leads
  add column if not exists ctv_code text,
  add column if not exists refunded_at timestamptz;

-- status trên leads vốn không có CHECK constraint (chỉ "pending"/"paid" theo quy
-- ước ứng dụng) nên thêm giá trị "refunded" không cần ALTER gì thêm.
