import { NextRequest, NextResponse } from "next/server";
import { checkAdminPass } from "@/lib/admin-auth";
import { isOrdersConfigured, getTopCustomersThisMonth } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isOrdersConfigured) {
    return NextResponse.json(
      { error: "not_configured", message: "Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  const customers = await getTopCustomersThisMonth(10);
  return NextResponse.json({ customers });
}
