export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category: string;
  stock_quantity: number;
  image_urls: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string | null;
  discount_text: string | null;
  banner_image_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
};

export type BuyerInfo = {
  name: string;
  phone: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  qty: number;
};

export type OrderStatus = "pending" | "paid";

export type Order = {
  orderId: string;
  items: CartItem[];
  totalAmount: number;
  customerName: string;
  phone: string;
  address: string;
  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
};
