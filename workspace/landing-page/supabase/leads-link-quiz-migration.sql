-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Liên kết đơn hàng (leads) với kết quả quiz gốc (quiz_leads) — vì giờ
-- khách chỉ điền 1 form duy nhất ở bước quiz, sau đó chỉ còn bấm thanh toán.

alter table public.leads
  add column if not exists quiz_lead_id uuid references public.quiz_leads(id);
