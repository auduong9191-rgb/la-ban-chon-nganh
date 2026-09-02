import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createOrder, getOrder } from "@/lib/orders";
import { getProductsByIds } from "@/lib/products";
import { getEffectivePrice } from "@/lib/format";
import { generateOrderId } from "@/lib/sepay";
import type { CartItem, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

type CheckoutRequestBody = {
  items: { productId: string; qty: number }[];
  customerName: string;
  phone: string;
  address: string;
};

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: "Hệ thống thanh toán chưa được cấu hình (Supabase).",
      },
      { status: 503 }
    );
  }

  let body: CheckoutRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { items, customerName, phone, address } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }
  if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "missing_customer_info", message: "Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ." },
      { status: 400 }
    );
  }

  const productIds = items.map((i) => i.productId);
  const products = await getProductsByIds(productIds);
  const productById = new Map(products.map((p) => [p.id, p]));

  const orderItems: CartItem[] = [];
  for (const { productId, qty } of items) {
    const product = productById.get(productId);
    if (!product || !product.is_active || qty <= 0) continue;
    orderItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: getEffectivePrice(product),
      imageUrl: product.image_urls[0] ?? null,
      qty,
    });
  }

  if (orderItems.length === 0) {
    return NextResponse.json(
      { error: "invalid_items", message: "Sản phẩm trong giỏ không còn khả dụng." },
      { status: 400 }
    );
  }

  const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  let orderId = generateOrderId();
  for (let attempt = 0; attempt < 3 && (await getOrder(orderId)); attempt++) {
    orderId = generateOrderId();
  }

  const order: Order = {
    orderId,
    items: orderItems,
    totalAmount,
    customerName: customerName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
    paidAt: null,
  };

  await createOrder(order);

  return NextResponse.json({ orderId, totalAmount });
}
