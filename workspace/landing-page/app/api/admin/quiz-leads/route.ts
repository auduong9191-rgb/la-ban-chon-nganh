// GET /api/admin/quiz-leads?search=
// Headers: x-admin-pass: <password>
//
// Trả về lead từ bảng quiz_leads (kết quả bài test VAKAD free) để chủ shop
// lấy khối học/học lực/VAKAD/số học đưa vào Gem 2 chạy thủ công cho khách đã trả phí.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAdminPass } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type QuizLead = {
  id: string;
  ten_phu_huynh: string | null;
  ho_ten: string;
  dob: string;
  khoi_hoc: string;
  hoc_luc: string;
  email: string | null;
  phone: string | null;
  vakad_dominant: string | null;
  duong_doi: number;
  ngay_sinh: number;
  su_menh: number | null;
  linh_hon: number | null;
  free_report: string | null;
  has_vakad: boolean;
  created_at: string;
};

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";

  try {
    const { data, error } = await supabaseAdmin
      .from("quiz_leads")
      .select(
        "id, ten_phu_huynh, ho_ten, dob, khoi_hoc, hoc_luc, email, phone, vakad_dominant, duong_doi, ngay_sinh, su_menh, linh_hon, free_report, has_vakad, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/admin/quiz-leads] supabase error:", error.message);
      return NextResponse.json(
        { error: "internal_error", message: error.message },
        { status: 500 }
      );
    }

    let leads = (data ?? []) as QuizLead[];

    if (search) {
      leads = leads.filter(
        (l) =>
          l.ho_ten.toLowerCase().includes(search) ||
          l.khoi_hoc.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ leads });
  } catch (err) {
    console.error("[/api/admin/quiz-leads]", err);
    return NextResponse.json(
      {
        error: "internal_error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
