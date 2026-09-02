// PATCH /api/admin/leads/[id]/career-map
// Headers: x-admin-pass: <password>
// Body: multipart/form-data — field "text" (string, optional) và/hoặc
// field "file" (PDF/ảnh, optional, tối đa 10MB — giới hạn của bucket).
//
// Đính nội dung/file Career Map (Gem 2, chạy thủ công ngoài hệ thống) vào
// đúng đơn hàng (leads.id). File thật lưu trong Storage bucket "career-maps"
// (private), path cố định theo leadId nên upload lại = ghi đè file cũ.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAdminPass } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24; // 24h, đủ để admin tải xuống sau khi lưu

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]/career-map">
) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 }
    );
  }

  const text = form.get("text");
  const file = form.get("file");

  const hasText = typeof text === "string";
  const hasFile = file instanceof File && file.size > 0;

  if (!hasText && !hasFile) {
    return NextResponse.json(
      { error: "Không có nội dung hoặc file nào để lưu." },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {
    career_map_updated_at: new Date().toISOString(),
  };

  if (hasText) {
    update.career_map_text = (text as string).trim() || null;
  }

  if (hasFile) {
    const f = file as File;
    const ext = f.name.includes(".") ? f.name.split(".").pop() : "";
    const path = `${id}/career-map${ext ? `.${ext}` : ""}`;
    const buffer = Buffer.from(await f.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("career-maps")
      .upload(path, buffer, {
        contentType: f.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("[/api/admin/leads/career-map] upload error:", uploadError.message);
      return NextResponse.json(
        { error: "internal_error", message: uploadError.message },
        { status: 500 }
      );
    }

    update.career_map_file_path = path;
    update.career_map_file_name = sanitizeFileName(f.name);
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update(update)
    .eq("id", id)
    .select("career_map_text, career_map_file_path, career_map_file_name, career_map_updated_at")
    .maybeSingle();

  if (error || !data) {
    console.error("[/api/admin/leads/career-map] update error:", error?.message);
    return NextResponse.json(
      { error: "internal_error", message: error?.message },
      { status: 500 }
    );
  }

  let career_map_file_url: string | null = null;
  if (data.career_map_file_path) {
    const { data: signed } = await supabaseAdmin.storage
      .from("career-maps")
      .createSignedUrl(data.career_map_file_path, SIGNED_URL_TTL_SECONDS);
    career_map_file_url = signed?.signedUrl ?? null;
  }

  return NextResponse.json({ ...data, career_map_file_url });
}
