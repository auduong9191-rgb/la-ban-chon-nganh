// GET /api/cron/send-survey-email
//
// Gọi bởi Vercel Cron (xem vercel.json) — 1 lần/ngày (giới hạn plan Hobby).
// Trigger 4: 72h sau khi khách nhận trọn bộ báo cáo (mốc leads.strategy_updated_at,
// set ở Trigger 3 trong generate-career-map/route.ts), gửi email mời khảo sát
// nhận quà Checklist chọn ngành — CHỈ cho khách cá nhân (không gắn CTV hợp lệ)
// + khách CTV nhóm 1. CTV nhóm 2 bị loại vì họ tự chăm sóc khách qua kênh
// riêng (tự xuất Career Map, Gem 2 ngoài hệ thống) — gửi thêm dễ trùng/thừa
// thông điệp với những gì CTV nhóm 2 đang tự làm.
//
// Vì Hobby cron chỉ chạy tối đa 1 lần/ngày, mốc "72h" thực tế sẽ dao động
// 72h-96h tuỳ giờ lead nhận báo cáo so với giờ cron chạy — chấp nhận được cho
// use case này. Nâng lên Pro (cron theo giờ) nếu cần chính xác hơn.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { findActiveCtv } from "@/lib/ctv";
import { sendSurveyInviteEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000;
// An toàn tránh 1 lần chạy xử lý quá nhiều lead nếu cron bị miss nhiều ngày
// liền — phần còn lại tự động rơi vào lần chạy kế tiếp vì survey_email_sent_at
// vẫn NULL (không có gì bị bỏ sót, chỉ bị dồn sang ngày sau).
const BATCH_LIMIT = 200;

type QuizFields = {
  ho_ten: string;
  has_vakad: boolean | null;
  parent_email: string | null;
};

// Không set CRON_SECRET thì coi như chưa bật bảo vệ (tiện test tay qua trình
// duyệt) nhưng log cảnh báo — production nên luôn set để tránh ai đó gọi
// endpoint tuỳ ý kích hoạt gửi email hàng loạt.
function checkCronAuth(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.warn(
      "[cron/send-survey-email] CRON_SECRET chưa được set — endpoint đang KHÔNG được bảo vệ."
    );
    return true;
  }
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!checkCronAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoffIso = new Date(Date.now() - SEVENTY_TWO_HOURS_MS).toISOString();

  const { data: candidates, error } = await supabaseAdmin
    .from("leads")
    .select(
      `id, email, ctv_code, strategy_updated_at,
       quiz_leads(ho_ten, has_vakad, parent_email)`
    )
    .not("strategy_updated_at", "is", null)
    .lte("strategy_updated_at", cutoffIso)
    .is("survey_email_sent_at", null)
    .order("strategy_updated_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (error) {
    console.error("[cron/send-survey-email] query error:", error.message);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  let sent = 0;
  let skippedCtvGroup2 = 0;
  let skippedNoEmail = 0;
  let failed = 0;

  for (const lead of candidates ?? []) {
    if (!lead.email) {
      skippedNoEmail++;
      continue;
    }

    // Best-effort — cùng cơ chế tra cứu CTV dùng ở Trigger 1-3 (lib/ctv.ts):
    // không có ctv_code, hoặc CTV không active/không tìm thấy => coi là
    // "khách cá nhân", vẫn nằm trong diện gửi. Chỉ loại đúng CTV nhóm 2.
    const ctv = await findActiveCtv(lead.ctv_code);
    if (ctv && ctv.group_type === "2") {
      skippedCtvGroup2++;
      continue;
    }

    const quiz = (Array.isArray(lead.quiz_leads) ? lead.quiz_leads[0] : lead.quiz_leads) as
      | QuizFields
      | null;
    const hoTen = quiz?.ho_ten ?? "bạn";
    const hasVakad = !!quiz?.has_vakad;

    try {
      await Promise.all([
        sendSurveyInviteEmail({
          to: lead.email,
          hoTen,
          audience: hasVakad ? "student" : "parent",
        }),
        quiz?.parent_email
          ? sendSurveyInviteEmail({ to: quiz.parent_email, hoTen, audience: "parent" })
          : Promise.resolve(),
      ]);

      const { error: updateError } = await supabaseAdmin
        .from("leads")
        .update({ survey_email_sent_at: new Date().toISOString() })
        .eq("id", lead.id);
      if (updateError) {
        // Email đã gửi thành công nhưng đánh dấu thất bại — log rõ để xử lý
        // tay, vì nếu không đánh dấu được, lần cron sau sẽ gửi trùng cho lead này.
        console.error(
          `[cron/send-survey-email] lead ${lead.id}: gửi email OK nhưng update survey_email_sent_at lỗi:`,
          updateError.message
        );
      }
      sent++;
    } catch (err) {
      // Không đánh dấu survey_email_sent_at — lần cron sau (ngày kế tiếp) sẽ
      // tự thử lại cho lead này.
      console.error(`[cron/send-survey-email] lead ${lead.id}: gửi email lỗi:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    processed: candidates?.length ?? 0,
    sent,
    skippedCtvGroup2,
    skippedNoEmail,
    failed,
  });
}
