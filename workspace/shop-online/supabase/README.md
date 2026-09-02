# Setup Supabase (sản phẩm + đơn hàng + khuyến mãi)

1. Vào https://supabase.com → New project (chọn region Singapore cho gần VN).
2. Vào SQL Editor → dán nội dung `schema.sql` → Run (tạo bảng `products`, `orders`, `promotions`).
3. Vào Storage → New bucket → tên chính xác `product-images` → tick **Public bucket** → Save.
4. (Tuỳ chọn) Dán nội dung `seed.sql` → Run — tự tạo sẵn 19 sản phẩm thật của THẢO MỘC NHÀ THUỶ (chưa có ảnh, admin upload sau) + 1 khuyến mãi mẫu.
5. Vào Project Settings → API → copy:
   - `Project URL` → dán vào `SUPABASE_URL` trong `.env.local`
   - `service_role` key (không phải `anon` key) → dán vào `SUPABASE_SECRET_KEY`

**Lưu ý:** `service_role` key có toàn quyền, không bao giờ lộ ra client — code trong repo chỉ dùng nó ở server-side (`lib/supabase.ts` có `import "server-only"` chặn việc này bị import nhầm vào component client).
