import { NextRequest, NextResponse } from "next/server";
import { checkAdminPass } from "@/lib/admin-auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { slugify } from "@/lib/format";
import { uploadImages } from "@/lib/image-upload";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "not_configured", message: "Supabase chưa được cấu hình. Xem supabase/README.md." },
      { status: 503 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "not_configured", message: "Supabase chưa được cấu hình. Xem supabase/README.md." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const name = (form.get("name") as string | null)?.trim();
  const priceRaw = form.get("price");
  const salePriceRaw = form.get("sale_price");
  const category = (form.get("category") as string | null)?.trim() || "Khác";
  const description = (form.get("description") as string | null)?.trim() || null;
  const stockRaw = form.get("stock_quantity");
  const images = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  const price = Number(priceRaw);
  const stock_quantity = Number(stockRaw ?? 0);
  const sale_price =
    typeof salePriceRaw === "string" && salePriceRaw.trim() !== "" ? Number(salePriceRaw) : null;

  if (!name || !Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "invalid_fields", message: "Thiếu tên hoặc giá sản phẩm không hợp lệ." },
      { status: 400 }
    );
  }
  if (sale_price != null && (!Number.isFinite(sale_price) || sale_price < 0 || sale_price >= price)) {
    return NextResponse.json(
      { error: "invalid_fields", message: "Giá khuyến mãi phải nhỏ hơn giá gốc." },
      { status: 400 }
    );
  }

  let slug = slugify(name);
  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  let image_urls: string[] = [];
  try {
    image_urls = await uploadImages(images);
  } catch (err) {
    return NextResponse.json(
      { error: "upload_failed", message: (err as Error).message },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name,
      slug,
      description,
      price,
      sale_price,
      category,
      stock_quantity: Number.isFinite(stock_quantity) ? stock_quantity : 0,
      image_urls,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}
