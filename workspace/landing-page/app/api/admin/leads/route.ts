// GET /api/admin/leads?status=&search=&fromDate=&toDate=
// Headers: x-admin-pass: <password>
//
// Check header pass với env, query bảng `leads` trong Supabase, filter, return JSON.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAdminPass } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type QuizJoin = {
  ho_ten: string;
  dob: string;
  khoi_hoc: string;
  hoc_luc: string;
  // null = luồng phụ huynh (bỏ qua bài test VAKAD, đi thẳng thanh toán)
  vakad_dominant: string | null;
  duong_doi: number;
  ngay_sinh: number;
  su_menh: number | null;
  linh_hon: number | null;
  ten_phu_huynh: string | null;
  free_report: string | null;
  has_vakad: boolean;
  parent_email: string | null;
};

type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string | null;
  order_id: string | null;
  product_name: string | null;
  amount: number | null;
  status: string | null;
  paid_at: string | null;
  created_at: string;
  ctv_code: string | null;
  refunded_at: string | null;
  discount_code: string | null;
  discount_percent: number | null;
  original_amount: number | null;
  career_map_text: string | null;
  career_map_file_path: string | null;
  career_map_file_name: string | null;
  career_map_updated_at: string | null;
  strategy_text: string | null;
  strategy_file_path: string | null;
  strategy_file_name: string | null;
  strategy_updated_at: string | null;
  vakad_report_file_path: string | null;
  vakad_report_file_name: string | null;
  vakad_report_updated_at: string | null;
  // Without a generated Database type, the TS overload for .select() guesses
  // this is an array, but PostgREST actually returns a single object at
  // runtime for a belongs-to (many-to-one) embed — handle both shapes below.
  quiz_leads: QuizJoin | QuizJoin[] | null;
};

type Lead = Omit<LeadRow, "quiz_leads"> & {
  career_map_file_url?: string | null;
  strategy_file_url?: string | null;
  vakad_report_file_url?: string | null;
  quiz_leads: QuizJoin | null;
};

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  try {
    let query = supabaseAdmin
      .from("leads")
      .select(
        `id, name, phone, email, source, order_id, product_name, amount, status, paid_at, created_at,
         ctv_code, refunded_at, discount_code, discount_percent, original_amount,
         career_map_text, career_map_file_path, career_map_file_name, career_map_updated_at,
         strategy_text, strategy_file_path, strategy_file_name, strategy_updated_at,
         vakad_report_file_path, vakad_report_file_name, vakad_report_updated_at,
         quiz_leads(ho_ten, dob, khoi_hoc, hoc_luc, vakad_dominant, duong_doi, ngay_sinh, su_menh, linh_hon, ten_phu_huynh, free_report, has_vakad, parent_email)`
      )
      .order("created_at", { ascending: false });

    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) query = query.lte("created_at", toDate);

    const { data, error } = await query;

    if (error) {
      console.error("[/api/admin/leads] supabase error:", error.message);
      return NextResponse.json(
        { error: "internal_error", message: error.message },
        { status: 500 }
      );
    }

    let leads = ((data ?? []) as LeadRow[]).map((row) => ({
      ...row,
      quiz_leads: (Array.isArray(row.quiz_leads) ? row.quiz_leads[0] : row.quiz_leads) ?? null,
    })) as Lead[];

    if (status && status !== "all") {
      leads = leads.filter((l) => l.status === status);
    }

    if (search) {
      leads = leads.filter(
        (l) =>
          (l.name ?? "").toLowerCase().includes(search) ||
          (l.phone ?? "").includes(search) ||
          (l.email ?? "").toLowerCase().includes(search) ||
          (l.order_id ?? "").toLowerCase().includes(search)
      );
    }

    const stats = {
      totalAll: leads.length,
      totalPaid: 0,
      totalPending: 0,
      revenue: 0,
    };
    for (const l of leads) {
      if (l.status === "paid") {
        stats.totalPaid++;
        stats.revenue += l.amount ?? 0;
      } else if (l.status === "pending") {
        stats.totalPending++;
      }
    }

    await Promise.all(
      leads.map(async (l) => {
        if (l.career_map_file_path) {
          const { data: signed } = await supabaseAdmin.storage
            .from("career-maps")
            .createSignedUrl(l.career_map_file_path, 60 * 60 * 24);
          l.career_map_file_url = signed?.signedUrl ?? null;
        }
        if (l.strategy_file_path) {
          const { data: signed } = await supabaseAdmin.storage
            .from("career-maps")
            .createSignedUrl(l.strategy_file_path, 60 * 60 * 24);
          l.strategy_file_url = signed?.signedUrl ?? null;
        }
        if (l.vakad_report_file_path) {
          const { data: signed } = await supabaseAdmin.storage
            .from("career-maps")
            .createSignedUrl(l.vakad_report_file_path, 60 * 60 * 24);
          l.vakad_report_file_url = signed?.signedUrl ?? null;
        }
      })
    );

    return NextResponse.json({ leads, stats });
  } catch (err) {
    console.error("[/api/admin/leads]", err);
    return NextResponse.json(
      {
        error: "internal_error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
