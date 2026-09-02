-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Lưu song song báo cáo "Chiến lược Chọn ngành, Chọn trường & Lộ trình xét
-- tuyển 360°" (Gem 3) — cùng cơ chế với career_map_* (bucket "career-maps",
-- signed URL) nhưng là 1 file PDF riêng, đính kèm cùng email với Career Map.

alter table public.leads
  add column if not exists strategy_text text,
  add column if not exists strategy_file_path text,
  add column if not exists strategy_file_name text,
  add column if not exists strategy_updated_at timestamptz;
