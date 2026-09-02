import { NextRequest, NextResponse } from "next/server";
import { checkAdminPass } from "@/lib/admin-auth";
import { isOrdersConfigured, listOrders, markOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isOrdersConfigured) {
    return NextResponse.json(
      { error: "not_configured", message: "Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isOrdersConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.orderId) {
    return NextResponse.json({ error: "missing_order_id" }, { status: 400 });
  }

  const order = await markOrderPaid(body.orderId);
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
