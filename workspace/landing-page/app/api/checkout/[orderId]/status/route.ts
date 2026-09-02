import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/checkout/[orderId]/status">
) {
  const { orderId } = await ctx.params;

  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("status")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("[/api/checkout/status] supabase error:", error.message);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ status: data.status });
}
