-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Thêm Sứ Mệnh + Linh Hồn — giờ tính cứng trong code (đúng công thức Tiara Edu),
-- không còn để AI tính, nên cần lưu lại như 2 chỉ số cố định còn lại.

alter table public.quiz_leads
  add column if not exists su_menh integer,
  add column if not exists linh_hon integer;
