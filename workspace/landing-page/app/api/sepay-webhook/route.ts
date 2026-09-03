// POST /api/sepay-webhook
// Headers: Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>
//
// Verify auth -> dedup theo payload.id -> filter transferType 'in' -> parse order_id
// từ content -> mark order paid trong Supabase (bảng `leads`).
//
// LUÔN return 200 trừ lỗi auth, để Sepay không retry gây duplicate xử lý.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseOrderIdFromContent, verifySepayAuth, SepayWebhookPayload } from "@/lib/sepay";
import { sendTelegramNotification, formatPaymentNotification } from "@/lib/telegram";
import { notifyCtvPaidOrder } from "@/lib/ctv";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SEPAY_WEBHOOK_API_KEY;
  if (!apiKey || !verifySepayAuth(req.headers.get("authorization"), apiKey)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: SepayWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    // Trả 200 để Sepay không retry một payload không parse được.
    return NextResponse.json({ success: true, note: "invalid_json_ignored" });
  }

  try {
    // Dedup: insert transaction id, nếu đã tồn tại (conflict) thì đã xử lý rồi -> bỏ qua.
    const { error: dedupError } = await supabaseAdmin
      .from("sepay_webhook_events")
      .insert({ id: payload.id });

    if (dedupError) {
      if (dedupError.code === "23505") {
        return NextResponse.json({ success: true, note: "duplicate_ignored" });
      }
      console.error("[/api/sepay-webhook] dedup insert error:", dedupError.message);
      return NextResponse.json({ success: true, note: "dedup_error_ignored" });
    }

    if (payload.transferType !== "in") {
      return NextResponse.json({ success: true, note: "not_incoming_ignored" });
    }

    const orderId = parseOrderIdFromContent(payload.content);
    if (!orderId) {
      console.error("[/api/sepay-webhook] cannot parse order_id from content:", payload.content);
      return NextResponse.json({ success: true, note: "order_id_not_found" });
    }

    const { data: lead, error: findError } = await supabaseAdmin
      .from("leads")
      .select("order_id, name, phone, email, product_name, amount, status, ctv_code, quiz_lead_id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (findError) {
      console.error("[/api/sepay-webhook] lookup error:", findError.message);
      return NextResponse.json({ success: true, note: "lookup_error_ignored" });
    }

    if (!lead) {
      console.error("[/api/sepay-webhook] order not found:", orderId);
      return NextResponse.json({ success: true, note: "order_not_found" });
    }

    if (lead.status === "paid") {
      return NextResponse.json({ success: true, note: "already_paid" });
    }

    // Chấp nhận thanh toán thừa, từ chối thiếu (chỉ log, không block webhook).
    if (payload.transferAmount < (lead.amount ?? 0)) {
      console.error(
        `[/api/sepay-webhook] underpayment for ${orderId}: expected ${lead.amount}, got ${payload.transferAmount}`
      );
      return NextResponse.json({ success: true, note: "underpayment_ignored" });
    }

    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_reference_code: payload.referenceCode,
        payment_gateway: payload.gateway,
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("[/api/sepay-webhook] update error:", updateError.message);
    }

    // Side effects — lỗi ở đây không được làm fail webhook response (Sepay retry gây duplicate).
    const [telegramResult, ctvNotifyResult] = await Promise.allSettled([
      sendTelegramNotification(
        formatPaymentNotification({
          orderId,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          productName: lead.product_name ?? "",
          amount: payload.transferAmount,
          gateway: payload.gateway,
        })
      ),
      // Trigger 2 — báo CTV (cả 2 nhóm) ngay khi có đơn mới thanh toán, để họ
      // chủ động chăm sóc/upsell (nhóm 2 xuất luôn Career Map) thay vì chủ
      // shop phải tự check rồi báo lại tay.
      notifyCtvPaidOrder({
        ctvCode: lead.ctv_code,
        quizLeadId: lead.quiz_lead_id,
        tenPhuHuynh: lead.name,
        phone: lead.phone,
        email: lead.email,
        productName: lead.product_name ?? "",
        amount: payload.transferAmount,
        paidAt: new Date().toISOString(),
      }),
      // TODO: sendCustomerEmail(lead) + sendOwnerEmail(lead) sau khi wire /biz-email-setup.
    ]);
    if (telegramResult.status === "rejected") {
      console.error("[/api/sepay-webhook] telegram notify failed:", telegramResult.reason);
    }
    if (ctvNotifyResult.status === "rejected") {
      console.error("[/api/sepay-webhook] ctv notify failed:", ctvNotifyResult.reason);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/sepay-webhook] unexpected error:", err);
    return NextResponse.json({ success: true, note: "internal_error_ignored" });
  }
}
