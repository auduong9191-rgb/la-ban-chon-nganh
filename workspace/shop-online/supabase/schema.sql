-- Chạy trong Supabase SQL editor sau khi tạo project mới.
-- Sau khi chạy: vào Storage > New bucket > tên "product-images", Public bucket = ON.

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price integer not null check (price >= 0),
  sale_price integer check (sale_price is null or sale_price >= 0),
  category text not null default 'Khác',
  stock_quantity integer not null default 0,
  image_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_is_active_idx on products (is_active);

alter table products enable row level security;

-- Đơn hàng — mã đơn dạng "DH000123" làm primary key, giống format hiển thị nội dung chuyển khoản.
create table if not exists orders (
  order_id text primary key,
  items jsonb not null,
  total_amount integer not null check (total_amount >= 0),
  customer_name text not null,
  phone text not null,
  address text not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_phone_idx on orders (phone);
create index if not exists orders_status_created_idx on orders (status, created_at);

alter table orders enable row level security;

-- Khuyến mãi — 1 hàng đang bật tại một thời điểm, admin sửa nội dung qua /admin.
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount_text text,
  banner_image_url text,
  is_active boolean not null default true,
  start_date timestamptz,
  end_date timestamptz,
  updated_at timestamptz not null default now()
);

alter table promotions enable row level security;

-- Dedup Sepay webhook — mỗi transaction id của Sepay chỉ xử lý 1 lần dù webhook có retry.
create table if not exists sepay_webhook_events (
  event_id bigint primary key,
  received_at timestamptz not null default now()
);

alter table sepay_webhook_events enable row level security;

-- RLS bật nhưng không có policy nào — mọi truy cập đi qua service-role key
-- từ API route server-side (app/api/admin/*, app/api/checkout, app/api/products),
-- giống pattern đã dùng ổn định ở dự án workspace/landing-page.
