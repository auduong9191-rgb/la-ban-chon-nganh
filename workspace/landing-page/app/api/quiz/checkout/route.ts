// POST /api/quiz/checkout
// Body: { quizLeadId: string }
//
// Tạo đơn hàng thanh toán trực tiếp từ 1 lead quiz đã có sẵn (không hỏi lại
// tên/SĐT/email) — khách chỉ còn quyết định thanh toán hay không.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateOrderId, generateVietQRUrl } from "@/lib/sepay";
import { offer } from "@/lib/offer";

const RECOMMENDED_TIER = offer.pricing.tiers.find((t) => t.isRecommended)!;
const PRODUCT_NAME = `${offer.productName} - ${RECOMMENDED_TIER.name}`;
const AMOUNT_VND = RECOMMENDED_TIER.priceVnd;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 }
    );
  }

  const { quizLeadId } = (body ?? {}) as { quizLeadId?: string };
  if (!quizLeadId) {
    return NextResponse.json(
      { error: "Thiếu thông tin kết quả quiz." },
      { status: 400 }
    );
  }

  const { data: quizLead, error: quizLeadError } = await supabaseAdmin
    .from("quiz_leads")
    .select("ten_phu_huynh, ho_ten, email, phone, ctv_code")
    .eq("id", quizLeadId)
    .maybeSingle();

  if (quizLeadError || !quizLead) {
    return NextResponse.json(
      { error: "Không tìm thấy kết quả quiz, vui lòng làm lại bài test." },
      { status: 404 }
    );
  }

  const bankAccount = process.env.SEPAY_BANK_ACCOUNT_NUMBER;
  const bankName = process.env.SEPAY_BANK_NAME;
  if (!bankAccount || !bankName) {
    console.error("Missing SEPAY_BANK_ACCOUNT_NUMBER or SEPAY_BANK_NAME env vars");
    return NextResponse.json(
      { error: "Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau." },
      { status: 500 }
    );
  }

  let orderId = "";
  let inserted = false;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    orderId = generateOrderId();
    const { error } = await supabaseAdmin.from("leads").insert({
      name: quizLead.ten_phu_huynh || quizLead.ho_ten,
      phone: quizLead.phone,
      email: quizLead.email,
      source: "tiara-edu-quiz",
      quiz_lead_id: quizLeadId,
      ctv_code: quizLead.ctv_code,
      order_id: orderId,
      product_name: `${PRODUCT_NAME} — cho con: ${quizLead.ho_ten}`,
      amount: AMOUNT_VND,
      status: "pending",
    });

    if (!error) {
      inserted = true;
    } else if (error.code === "23505") {
      lastError = error.message;
      continue;
    } else {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "Không thể tạo đơn hàng, vui lòng thử lại." },
        { status: 500 }
      );
    }
  }

  if (!inserted) {
    console.error("Failed to generate unique order_id after retries:", lastError);
    return NextResponse.json(
      { error: "Không thể tạo đơn hàng, vui lòng thử lại." },
      { status: 500 }
    );
  }

  const qrUrl = generateVietQRUrl({
    accountNumber: bankAccount,
    bank: bankName,
    amount: AMOUNT_VND,
    content: orderId,
    template: "compact",
  });

  return NextResponse.json({
    orderId,
    amount: AMOUNT_VND,
    bankInfo: { bank: bankName, accountNumber: bankAccount },
    qrUrl,
  });
}
