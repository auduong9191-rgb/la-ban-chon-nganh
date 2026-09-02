import "server-only";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { CartItem, Order, OrderStatus } from "@/lib/types";

export const isOrdersConfigured = isSupabaseConfigured;

type OrderRow = {
  order_id: string;
  items: CartItem[];
  total_amount: number;
  customer_name: string;
  phone: string;
  address: string;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
};

function rowToOrder(row: OrderRow): Order {
  return {
    orderId: row.order_id,
    items: row.items,
    totalAmount: row.total_amount,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    status: row.status,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

export async function createOrder(order: Order): Promise<void> {
  if (!supabaseAdmin) throw new Error("Supabase chưa được cấu hình");
  const { error } = await supabaseAdmin.from("orders").insert({
    order_id: order.orderId,
    items: order.items,
    total_amount: order.totalAmount,
    customer_name: order.customerName,
    phone: order.phone,
    address: order.address,
    status: order.status,
    created_at: order.createdAt,
    paid_at: order.paidAt,
  });
  if (error) throw new Error(error.message);
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToOrder(data as OrderRow);
}

/** Idempotent — gọi lại nhiều lần với cùng orderId không tạo hiệu ứng phụ thêm. */
export async function markOrderPaid(orderId: string): Promise<Order | null> {
  if (!supabaseAdmin) return null;
  const order = await getOrder(orderId);
  if (!order) return null;
  if (order.status === "paid") return order;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return rowToOrder(data as OrderRow);
}

export async function listOrders(): Promise<Order[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as OrderRow[]).map(rowToOrder);
}

export type TopCustomer = {
  phone: string;
  customerName: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

/** Top khách theo số đơn ĐÃ THANH TOÁN trong tháng hiện tại, gom theo số điện thoại. */
export async function getTopCustomersThisMonth(limit = 10): Promise<TopCustomer[]> {
  if (!supabaseAdmin) return [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("phone, customer_name, total_amount, paid_at")
    .eq("status", "paid")
    .gte("paid_at", monthStart);
  if (error || !data) return [];

  const byPhone = new Map<string, TopCustomer>();
  for (const row of data as {
    phone: string;
    customer_name: string;
    total_amount: number;
    paid_at: string;
  }[]) {
    const existing = byPhone.get(row.phone);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += row.total_amount;
      if (row.paid_at > existing.lastOrderAt) {
        existing.lastOrderAt = row.paid_at;
        existing.customerName = row.customer_name;
      }
    } else {
      byPhone.set(row.phone, {
        phone: row.phone,
        customerName: row.customer_name,
        orderCount: 1,
        totalSpent: row.total_amount,
        lastOrderAt: row.paid_at,
      });
    }
  }

  return Array.from(byPhone.values())
    .sort((a, b) => b.orderCount - a.orderCount || b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

/** true nếu đây là lần đầu thấy event này (nên xử lý tiếp), false nếu là duplicate/retry từ Sepay. */
export async function markWebhookEventSeen(eventId: number): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const { data, error } = await supabaseAdmin
    .from("sepay_webhook_events")
    .insert({ event_id: eventId })
    .select("event_id");
  if (error) return false;
  return (data?.length ?? 0) > 0;
}
