// PATCH /api/admin/ctv/[id] — sửa thông tin CTV (tên/email/nhóm/hoa hồng) hoặc bật-tắt active
// Headers: x-admin-pass: <password>

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAdminPass } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/ctv/[id]">
) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const { name, email, groupType, commissionAmount, isActive } = (body ?? {}) as {
    name?: string;
    email?: string;
    groupType?: string;
    commissionAmount?: number;
    isActive?: boolean;
  };

  if (email !== undefined && !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) update.name = name.trim();
  if (typeof email === "string" && email.trim()) update.email = email.trim();
  if (groupType === "1" || groupType === "2") update.group_type = groupType;
  if (typeof commissionAmount === "number" && commissionAmount >= 0) {
    update.commission_amount = commissionAmount;
  }
  if (typeof isActive === "boolean") update.is_active = isActive;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Không có gì để cập nhật." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("ctv")
    .update(update)
    .eq("id", id)
    .select("id, ctv_code, name, email, group_type, commission_amount, is_active, created_at")
    .maybeSingle();

  if (error || !data) {
    console.error("[/api/admin/ctv/[id]] update error:", error?.message);
    return NextResponse.json(
      { error: "internal_error", message: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
