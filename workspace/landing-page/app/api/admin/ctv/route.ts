// GET /api/admin/ctv — danh sách CTV (cả active lẫn inactive, giữ đúng lịch sử báo cáo)
// POST /api/admin/ctv — tạo CTV mới, tự sinh mã CTV ẩn danh dạng tiara{nhóm}{số thứ tự}
// (không dùng tên thật, không để admin gõ tay — xem lib/ctv.ts)
//
// Headers: x-admin-pass: <password>

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAdminPass } from "@/lib/admin-auth";
import { generateCtvCode } from "@/lib/ctv";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_COMMISSION: Record<string, number> = { "1": 50000, "2": 200000 };

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("ctv")
    .select("id, ctv_code, name, email, group_type, commission_amount, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[/api/admin/ctv] supabase error:", error.message);
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ctv: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const { name, email, groupType, commissionAmount } = (body ?? {}) as {
    name?: string;
    email?: string;
    groupType?: string;
    commissionAmount?: number;
  };

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Vui lòng nhập tên CTV." }, { status: 400 });
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  const group = groupType === "2" ? "2" : "1";
  const commission =
    typeof commissionAmount === "number" && commissionAmount >= 0
      ? commissionAmount
      : DEFAULT_COMMISSION[group];

  let inserted = false;
  let created: { id: string; ctv_code: string } | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    const ctvCode = await generateCtvCode(group, attempt);
    const { data: row, error } = await supabaseAdmin
      .from("ctv")
      .insert({
        ctv_code: ctvCode,
        name: name.trim(),
        email: email.trim(),
        group_type: group,
        commission_amount: commission,
      })
      .select("id, ctv_code")
      .single();

    if (!error && row) {
      inserted = true;
      created = row;
    } else if (error?.code === "23505") {
      lastError = error.message;
      continue;
    } else {
      console.error("[/api/admin/ctv] insert error:", error?.message);
      return NextResponse.json(
        { error: "internal_error", message: error?.message },
        { status: 500 }
      );
    }
  }

  if (!inserted || !created) {
    console.error("[/api/admin/ctv] failed to generate unique ctv_code:", lastError);
    return NextResponse.json({ error: "Không thể tạo mã CTV, thử lại." }, { status: 500 });
  }

  return NextResponse.json({ id: created.id, ctvCode: created.ctv_code });
}
