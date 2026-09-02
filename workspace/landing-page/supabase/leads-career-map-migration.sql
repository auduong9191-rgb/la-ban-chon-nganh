-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Cho phép admin đính nội dung/file Career Map (Gem 2, chạy thủ công ngoài
-- hệ thống) vào đúng đơn hàng đã thanh toán.

alter table public.leads
  add column if not exists career_map_text text,
  add column if not exists career_map_file_path text,
  add column if not exists career_map_file_name text,
  add column if not exists career_map_updated_at timestamptz;

-- File thật nằm trong Storage bucket "career-maps" (private, đã tạo qua script
-- dùng service-role key) — career_map_file_path chỉ lưu đường dẫn trong bucket,
-- URL tải xuống được ký (signed URL) mới mỗi lần load trang /admin.
