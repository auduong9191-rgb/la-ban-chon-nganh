// PATCH /api/admin/leads/[id]/refund — đánh dấu 1 đơn đã hoàn tiền (cam kết hoàn
// tiền không lý do trong 7 ngày). Chỉ cho phép trên đơn đang "paid" — đơn "refunded"
// tự động bị loại khỏi doanh số/hoa hồng CTV vì mọi tính toán chỉ lọc status = "paid".
//
// Headers: x-admin-pass: <password>

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAdminPass } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]/refund">
) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const { data: current, error: findError } = await supabaseAdmin
    .from("leads")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (findError || !current) {
    return NextResponse.json({ error: "Không tìm thấy đơn." }, { status: 404 });
  }
  if (current.status !== "paid") {
    return NextResponse.json(
      { error: "Chỉ đánh dấu hoàn tiền được cho đơn đã thanh toán." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update({ status: "refunded", refunded_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status, refunded_at")
    .maybeSingle();

  if (error || !data) {
    console.error("[/api/admin/leads/[id]/refund] update error:", error?.message);
    return NextResponse.json(
      { error: "internal_error", message: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
