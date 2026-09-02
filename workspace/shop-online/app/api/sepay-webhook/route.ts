// Webhook nhận từ Sepay khi có giao dịch chuyển khoản vào tài khoản ngân hàng.
// Set URL này trên Sepay dashboard (my.sepay.vn) sau khi đã tạo tài khoản Sepay mới
// và điền SEPAY_WEBHOOK_API_KEY vào .env.local + Vercel — hiện tại route đã sẵn sàng
// nhưng chưa nhận traffic thật vì SEPAY_WEBHOOK_API_KEY còn để trống.

import { NextRequest, NextResponse } from "next/server";
import { verifySepayAuth, parseOrderIdFromContent, type SepayWebhookPayload } from "@/lib/sepay";
import { getOrder, markOrderPaid, markWebhookEventSeen } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY;
  if (!verifySepayAuth(req.headers.get("authorization"), expectedKey ?? "")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: SepayWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: true }); // luôn 200 để Sepay không retry vô hạn
  }

  const isNew = await markWebhookEventSeen(payload.id);
  if (!isNew) {
    return NextResponse.json({ success: true, dedup: true });
  }

  if (payload.transferType !== "in") {
    return NextResponse.json({ success: true, ignored: "not_incoming" });
  }

  const orderId = parseOrderIdFromContent(payload.content);
  if (!orderId) {
    console.error("[sepay-webhook] could not parse order id from content:", payload.content);
    return NextResponse.json({ success: true, ignored: "no_order_id" });
  }

  const order = await getOrder(orderId);
  if (!order) {
    console.error("[sepay-webhook] order not found:", orderId);
    return NextResponse.json({ success: true, ignored: "order_not_found" });
  }

  if (payload.transferAmount < order.totalAmount) {
    console.error(
      `[sepay-webhook] underpayment for ${orderId}: expected ${order.totalAmount}, got ${payload.transferAmount}`
    );
  }

  await markOrderPaid(orderId);

  return NextResponse.json({ success: true });
}
