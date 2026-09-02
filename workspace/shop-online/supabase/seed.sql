-- Chạy SAU khi đã chạy schema.sql. Tạo sẵn danh mục sản phẩm thật của THẢO MỘC NHÀ THUỶ
-- (giá đúng theo bảng giá khách cung cấp). Chưa có ảnh + mô tả — admin bổ sung sau qua /admin,
-- trang vẫn hiển thị bình thường ở dạng "ảnh đang cập nhật" cho tới khi có ảnh thật.

insert into products (name, slug, description, price, category, stock_quantity, image_urls, is_active) values
('Siro húng chanh 530ml', 'siro-hung-chanh-530ml', null, 190000, 'Thảo mộc dùng hằng ngày', 20, '{}', true),
('Siro húng chanh 330ml', 'siro-hung-chanh-330ml', null, 150000, 'Thảo mộc dùng hằng ngày', 20, '{}', true),
('Siro gừng nguyên chất', 'siro-gung-nguyen-chat', null, 190000, 'Thảo mộc dùng hằng ngày', 20, '{}', true),
('Siro gừng quất chanh sả 530ml', 'siro-gung-quat-chanh-sa-530ml', null, 180000, 'Thảo mộc dùng hằng ngày', 20, '{}', true),
('Siro gừng quất chanh sả 330ml', 'siro-gung-quat-chanh-sa-330ml', null, 140000, 'Thảo mộc dùng hằng ngày', 20, '{}', true),
('Cao Bát Trân Khang', 'cao-bat-tran-khang', null, 290000, 'Chăm sóc sức khỏe', 20, '{}', true),
('Cốt Nhàu lên men', 'cot-nhau-len-men', null, 180000, 'Chăm sóc sức khỏe', 20, '{}', true),
('Sữa tắm Sinh Khương Thập Mộc', 'sua-tam-sinh-khuong-thap-moc', null, 250000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Cốt gừng 10 thảo mộc', 'cot-gung-10-thao-moc', null, 150000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Cốt gừng tràm gió', 'cot-gung-tram-gio', null, 150000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Tinh dầu bưởi 50ml', 'tinh-dau-buoi-50ml', null, 250000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Tinh dầu tràm gió 50ml', 'tinh-dau-tram-gio-50ml', null, 190000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Tinh dầu tràm gió 10ml', 'tinh-dau-tram-gio-10ml', null, 60000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Dầu Sacha Inchi ép lạnh 50ml', 'dau-sacha-inchi-ep-lanh-50ml', null, 195000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Dầu mù u ép lạnh 50ml', 'dau-mu-u-ep-lanh-50ml', null, 195000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Dầu mù u ép lạnh 10ml', 'dau-mu-u-ep-lanh-10ml', null, 60000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Dầu gội thảo mộc', 'dau-goi-thao-moc', null, 190000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Dầu xả ủ tóc thảo mộc', 'dau-xa-u-toc-thao-moc', null, 250000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true),
('Nước cất tía tô 900ml', 'nuoc-cat-tia-to-900ml', null, 179000, 'Chăm sóc cơ thể, da và tóc', 20, '{}', true)
on conflict (slug) do nothing;

insert into promotions (title, description, discount_text, is_active) values (
  'Ưu đãi đơn hàng',
  'Đơn hàng từ 500.000đ được tặng ngay 1 tinh dầu tràm gió cao cấp 10ml cho bé hoặc 1 tinh dầu mù u ép lạnh 10ml (trị giá 60.000đ) — shop sẽ liên hệ xác nhận quà tặng khi đóng đơn.',
  'Miễn phí quà tặng cho đơn từ 500.000đ',
  true
)
on conflict do nothing;
