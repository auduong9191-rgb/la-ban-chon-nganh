import { NextRequest, NextResponse } from "next/server";
import { checkAdminPass } from "@/lib/admin-auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { uploadImages, deleteImageByUrl } from "@/lib/image-upload";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/products/[id]">
) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { id } = await ctx.params;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data: current, error: fetchError } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !current) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const name = form.get("name");
  if (typeof name === "string" && name.trim()) update.name = name.trim();

  const description = form.get("description");
  if (typeof description === "string") update.description = description.trim() || null;

  const price = form.get("price");
  if (typeof price === "string" && price.trim() !== "") {
    const n = Number(price);
    if (Number.isFinite(n) && n >= 0) update.price = n;
  }

  const effectivePrice = (update.price as number | undefined) ?? current.price;

  const salePriceRaw = form.get("sale_price");
  if (typeof salePriceRaw === "string") {
    if (salePriceRaw.trim() === "") {
      update.sale_price = null;
    } else {
      const n = Number(salePriceRaw);
      if (!Number.isFinite(n) || n < 0 || n >= effectivePrice) {
        return NextResponse.json(
          { error: "invalid_fields", message: "Giá khuyến mãi phải nhỏ hơn giá gốc." },
          { status: 400 }
        );
      }
      update.sale_price = n;
    }
  }

  const category = form.get("category");
  if (typeof category === "string" && category.trim()) update.category = category.trim();

  const stock = form.get("stock_quantity");
  if (typeof stock === "string" && stock.trim() !== "") {
    const n = Number(stock);
    if (Number.isFinite(n)) update.stock_quantity = n;
  }

  const isActive = form.get("is_active");
  if (typeof isActive === "string") update.is_active = isActive === "true";

  let imageUrls = (current.image_urls as string[]) ?? [];

  const removeRaw = form.get("removeImageUrls");
  if (typeof removeRaw === "string" && removeRaw) {
    try {
      const toRemove: string[] = JSON.parse(removeRaw);
      await Promise.all(toRemove.map((url) => deleteImageByUrl(url)));
      imageUrls = imageUrls.filter((u) => !toRemove.includes(u));
    } catch {
      // removeImageUrls không parse được — bỏ qua, giữ nguyên ảnh hiện tại.
    }
  }

  const newFiles = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (newFiles.length > 0) {
    try {
      const uploaded = await uploadImages(newFiles);
      imageUrls = [...imageUrls, ...uploaded];
    } catch (err) {
      return NextResponse.json(
        { error: "upload_failed", message: (err as Error).message },
        { status: 500 }
      );
    }
  }

  update.image_urls = imageUrls;

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "internal_error", message: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ product: data });
}

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/products/[id]">
) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { id } = await ctx.params;

  const { data: current } = await supabaseAdmin
    .from("products")
    .select("image_urls")
    .eq("id", id)
    .maybeSingle();

  if (current?.image_urls) {
    await Promise.all(
      (current.image_urls as string[]).map((url) => deleteImageByUrl(url))
    );
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
