-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Trigger 4 — 72h sau khi khách nhận trọn bộ báo cáo (mốc strategy_updated_at,
-- set ở Trigger 3 trong generate-career-map/route.ts), cron quét và gửi email
-- mời khách làm khảo sát để nhận quà Checklist chọn ngành (chỉ khách cá nhân
-- + khách CTV nhóm 1 — xem app/api/cron/send-survey-email/route.ts). Cột này
-- đánh dấu đã gửi để cron chạy lại (mỗi ngày) không gửi trùng.

alter table public.leads
  add column if not exists survey_email_sent_at timestamptz;
