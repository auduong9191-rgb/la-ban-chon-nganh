// POST /api/checkout/[orderId]/discount
// Body: { code: string }
//
// Áp mã giảm giá cho 1 đơn hàng đang chờ thanh toán:
// - tiara100 -> giảm 100%, đơn coi như đã thanh toán ngay (không cần mã QR).
// - tiara50 / tiara30 -> giảm 50%/30%, tính lại số tiền + mã QR mới.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateVietQRUrl } from "@/lib/sepay";
import { sendTelegramNotification } from "@/lib/telegram";
import { notifyCtvPaidOrder } from "@/lib/ctv";

export const dynamic = "force-dynamic";

const DISCOUNT_CODES: Record<string, number> = {
  TIARA100: 100,
  TIARA50: 50,
  TIARA30: 30,
};

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/checkout/[orderId]/discount">
) {
  const { orderId } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const { code } = (body ?? {}) as { code?: string };
  const normalizedCode = (code ?? "").trim().toUpperCase();
  const percent = DISCOUNT_CODES[normalizedCode];
  if (!percent) {
    return NextResponse.json({ error: "Mã giảm giá không hợp lệ." }, { status: 400 });
  }

  const { data: order, error: findError } = await supabaseAdmin
    .from("leads")
    .select(
      "order_id, name, phone, email, product_name, amount, status, original_amount, ctv_code, quiz_lead_id"
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (findError || !order) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json(
      { error: "Đơn hàng đã thanh toán, không thể áp dụng mã giảm giá." },
      { status: 400 }
    );
  }

  const baseAmount = order.original_amount ?? order.amount ?? 0;
  const newAmount = Math.round((baseAmount * (100 - percent)) / 100);

  if (percent === 100) {
    const paidAtIso = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({
        amount: 0,
        original_amount: baseAmount,
        discount_code: normalizedCode,
        discount_percent: percent,
        status: "paid",
        paid_at: paidAtIso,
        payment_gateway: "discount_code",
        payment_reference_code: normalizedCode,
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("[/api/checkout/discount] update error:", updateError.message);
      return NextResponse.json({ error: "Áp dụng mã giảm giá thất bại." }, { status: 500 });
    }

    // Non-blocking — chị Dương cần biết để chủ động tạo báo cáo dù không có
    // giao dịch ngân hàng nào để đối chiếu qua webhook. Đồng thời báo CTV
    // (nếu có, nhóm 2) giống hệt luồng thanh toán qua Sepay thật (Trigger 2)
    // — đơn miễn phí 100% qua mã giảm giá cũng là 1 đơn đã "chốt", CTV vẫn
    // cần biết để chủ động xuất Career Map.
    Promise.allSettled([
      sendTelegramNotification(
        `🎁 Mã giảm giá 100% (${normalizedCode}) vừa được áp dụng — đơn ${orderId}\n` +
          `Khách: ${order.name} | ${order.phone} | ${order.email}\n` +
          `Sản phẩm: ${order.product_name ?? "—"}\n` +
          `Đơn được coi như đã thanh toán — vào /admin để tạo báo cáo.`
      ),
      notifyCtvPaidOrder({
        ctvCode: order.ctv_code,
        quizLeadId: order.quiz_lead_id,
        tenPhuHuynh: order.name,
        phone: order.phone,
        email: order.email,
        productName: order.product_name ?? "",
        amount: 0,
        paidAt: paidAtIso,
      }),
    ]).then(([telegramResult, ctvResult]) => {
      if (telegramResult.status === "rejected") {
        console.error("[/api/checkout/discount] telegram notify failed:", telegramResult.reason);
      }
      if (ctvResult.status === "rejected") {
        console.error("[/api/checkout/discount] ctv notify failed:", ctvResult.reason);
      }
    });

    return NextResponse.json({ amount: 0, status: "paid", qrUrl: null });
  }

  const { error: updateError } = await supabaseAdmin
    .from("leads")
    .update({
      amount: newAmount,
      original_amount: baseAmount,
      discount_code: normalizedCode,
      discount_percent: percent,
    })
    .eq("order_id", orderId);

  if (updateError) {
    console.error("[/api/checkout/discount] update error:", updateError.message);
    return NextResponse.json({ error: "Áp dụng mã giảm giá thất bại." }, { status: 500 });
  }

  const bankAccount = process.env.SEPAY_BANK_ACCOUNT_NUMBER;
  const bankName = process.env.SEPAY_BANK_NAME;
  if (!bankAccount || !bankName) {
    console.error("[/api/checkout/discount] missing SEPAY bank env vars");
    return NextResponse.json({ error: "Hệ thống thanh toán chưa sẵn sàng." }, { status: 500 });
  }

  const qrUrl = generateVietQRUrl({
    accountNumber: bankAccount,
    bank: bankName,
    amount: newAmount,
    content: orderId,
    template: "compact",
  });

  return NextResponse.json({ amount: newAmount, status: "pending", qrUrl });
}
