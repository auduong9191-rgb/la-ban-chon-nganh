-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Thêm email + SĐT (Zalo) vào bảng quiz_leads — thu thập ngay ở bước quiz free
-- để có thể remarketing/gửi tài liệu hỗ trợ học tập qua Zalo cho người mua.

alter table public.quiz_leads
  add column if not exists email text,
  add column if not exists phone text;
