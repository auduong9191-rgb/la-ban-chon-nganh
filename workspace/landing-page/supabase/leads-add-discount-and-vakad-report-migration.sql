-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Mã giảm giá áp dụng ở bước thanh toán (tiara100/tiara50/tiara30).
alter table public.leads
  add column if not exists discount_code text,
  add column if not exists discount_percent integer,
  add column if not exists original_amount integer;

-- File PDF báo cáo Xu hướng Học tập (VAKAD) — báo cáo thứ 3, chỉ có khi
-- học sinh đã làm bài test VAKAD, gửi kèm email cùng Career Map + Chiến lược.
alter table public.leads
  add column if not exists vakad_report_file_path text,
  add column if not exists vakad_report_file_name text,
  add column if not exists vakad_report_updated_at timestamptz;
