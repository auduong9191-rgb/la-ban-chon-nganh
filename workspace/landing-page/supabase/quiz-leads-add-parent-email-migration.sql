-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Luồng học sinh: thêm ô "Email phụ huynh" không bắt buộc — nếu có điền,
-- khi gửi báo cáo trả phí sẽ gửi thêm 1 bản riêng (đúng văn phong "ba mẹ")
-- tới email này, ngoài bản gửi cho học sinh.
alter table public.quiz_leads
  add column if not exists parent_email text;
