-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Thêm tên phụ huynh — vì phụ huynh mới là người trả tiền/nhận báo cáo,
-- cần tách riêng với tên học sinh (ho_ten) để cá nhân hóa đúng người.

alter table public.quiz_leads
  add column if not exists ten_phu_huynh text;
