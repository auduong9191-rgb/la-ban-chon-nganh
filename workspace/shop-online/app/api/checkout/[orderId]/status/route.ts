import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/checkout/[orderId]/status">
) {
  const { orderId } = await ctx.params;
  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ status: order.status });
}
