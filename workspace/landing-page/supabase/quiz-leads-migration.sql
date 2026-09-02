-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Bảng riêng cho lead từ quiz VAKAD (khác với bảng `leads` = đơn hàng checkout).
-- Khi khách trả phí ở checkout, chủ shop đối chiếu qua tên/SĐT để lấy dữ liệu
-- (vakad_answers, khoi_hoc, hoc_luc, ho_ten, dob) đưa vào Gem 2 chạy thủ công.

create table if not exists public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  ho_ten text not null,
  dob date not null,
  khoi_hoc text not null,
  hoc_luc text not null,
  vakad_answers jsonb not null,
  vakad_scores jsonb not null,
  vakad_dominant text not null,
  duong_doi integer not null,
  ngay_sinh integer not null,
  free_report text not null,
  created_at timestamptz not null default now()
);

alter table public.quiz_leads enable row level security;

-- Không có policy nào cho anon/authenticated: bảng chỉ truy cập được qua
-- service-role / secret key (server-side) hoặc qua trang /admin.
