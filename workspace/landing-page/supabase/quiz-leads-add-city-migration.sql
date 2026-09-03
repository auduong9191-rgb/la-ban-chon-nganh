-- Chạy 1 lần trong Supabase Dashboard > SQL Editor
-- Thêm nơi ở (Tỉnh/Thành phố) của học sinh — dữ liệu đầu vào còn thiếu để
-- báo cáo Chiến lược 360° (Gem 3, Phần III) gợi ý trường sát với vị trí thực
-- tế của con thay vì chỉ dựa vào điểm chuẩn/học lực.

alter table public.quiz_leads
  add column if not exists noi_o text;
