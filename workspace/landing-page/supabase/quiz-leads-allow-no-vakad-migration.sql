-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Cho phép luồng phụ huynh (bỏ qua bài test VAKAD, đi thẳng thanh toán):
-- các cột VAKAD/free_report không còn bắt buộc, thêm cờ has_vakad để phân biệt rõ
-- 2 chế độ báo cáo (CHẾ ĐỘ 1 có VAKAD / CHẾ ĐỘ 2 không có VAKAD) khi tạo báo cáo trả phí.

alter table public.quiz_leads
  alter column vakad_answers drop not null,
  alter column vakad_scores drop not null,
  alter column vakad_dominant drop not null,
  alter column free_report drop not null;

alter table public.quiz_leads
  add column if not exists has_vakad boolean not null default true;

alter table public.quiz_leads
  alter column has_vakad set default false;
