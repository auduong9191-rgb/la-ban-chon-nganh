// GET /api/admin/ctv-performance?month=YYYY-MM
// Headers: x-admin-pass: <password>
//
// Báo cáo hiệu suất CTV theo tháng dương lịch (1 -> hết tháng, UTC). Tính trực
// tiếp trên dữ liệu gốc (không snapshot) — nên nếu 1 đơn cuối tháng bị hoàn
// tiền vào đầu tháng sau, chờ vài ngày rồi xem lại đúng tháng đó vẫn tự động
// phản ánh đúng số liệu (đơn refunded bị loại khỏi paidCount/doanh số).

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAdminPass } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type CtvRow = {
  ctv_code: string;
  name: string;
  group_type: string;
  commission_amount: number;
  is_active: boolean;
};

function resolveMonth(monthParam: string | null): string {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) return monthParam;
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = resolveMonth(searchParams.get("month"));
  const [y, m] = month.split("-").map(Number);
  const rangeStart = new Date(Date.UTC(y, m - 1, 1)).toISOString();
  const rangeEnd = new Date(Date.UTC(y, m, 1)).toISOString();

  try {
    const [ctvResult, quizResult, leadsResult] = await Promise.all([
      supabaseAdmin
        .from("ctv")
        .select("ctv_code, name, group_type, commission_amount, is_active")
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("quiz_leads")
        .select("ctv_code, created_at")
        .gte("created_at", rangeStart)
        .lt("created_at", rangeEnd),
      supabaseAdmin
        .from("leads")
        .select("ctv_code, amount, status, paid_at, discount_code")
        .gte("paid_at", rangeStart)
        .lt("paid_at", rangeEnd),
    ]);

    if (ctvResult.error || quizResult.error || leadsResult.error) {
      const message =
        ctvResult.error?.message || quizResult.error?.message || leadsResult.error?.message;
      console.error("[/api/admin/ctv-performance] supabase error:", message);
      return NextResponse.json({ error: "internal_error", message }, { status: 500 });
    }

    const quizLeads = quizResult.data ?? [];
    const leads = leadsResult.data ?? [];

    const report = ((ctvResult.data ?? []) as CtvRow[])
      .filter((ctv) => !!ctv.ctv_code)
      .map((ctv) => {
        const freeCount = quizLeads.filter((q) => q.ctv_code === ctv.ctv_code).length;
        const ctvLeads = leads.filter((l) => l.ctv_code === ctv.ctv_code);
        const paidLeads = ctvLeads.filter((l) => l.status === "paid");
        // Đơn áp mã TIARA100 (giảm 100%, coi như tặng) không phải đơn thực trả
        // tiền — đã tặng free rồi thì không trả thêm hoa hồng, chỉ đếm số lượt
        // dùng mã để theo dõi, không cộng vào paidCount/doanh số/hoa hồng.
        const tiara100Leads = paidLeads.filter((l) => l.discount_code === "TIARA100");
        const commissionLeads = paidLeads.filter((l) => l.discount_code !== "TIARA100");
        const refundCount = ctvLeads.filter((l) => l.status === "refunded").length;
        const revenue = commissionLeads.reduce((sum, l) => sum + (l.amount ?? 0), 0);
        const commission = commissionLeads.length * ctv.commission_amount;
        return {
          ctvCode: ctv.ctv_code,
          name: ctv.name,
          groupType: ctv.group_type,
          isActive: ctv.is_active,
          freeCount,
          paidCount: commissionLeads.length,
          tiara100Count: tiara100Leads.length,
          refundCount,
          revenue,
          commission,
        };
      });

    return NextResponse.json({ month, report });
  } catch (err) {
    console.error("[/api/admin/ctv-performance]", err);
    return NextResponse.json(
      { error: "internal_error", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
