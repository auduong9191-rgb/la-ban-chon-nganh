import { NextRequest, NextResponse } from "next/server";
import { checkAdminPass } from "@/lib/admin-auth";
import {
  isPromotionsConfigured,
  getActivePromotion,
  getPromotionById,
  upsertPromotion,
} from "@/lib/promotions";
import { uploadImages, deleteImageByUrl } from "@/lib/image-upload";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isPromotionsConfigured) {
    return NextResponse.json(
      { error: "not_configured", message: "Supabase chưa được cấu hình." },
      { status: 503 }
    );
  }

  const promotion = await getActivePromotion();
  return NextResponse.json({ promotion });
}

export async function PUT(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  if (!isPromotionsConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const id = (form.get("id") as string | null) || undefined;
  const title = (form.get("title") as string | null)?.trim();
  const description = (form.get("description") as string | null)?.trim() || null;
  const discountText = (form.get("discount_text") as string | null)?.trim() || null;
  const isActive = (form.get("is_active") as string | null) !== "false";
  const removeImage = (form.get("removeImage") as string | null) === "true";
  const imageFile = form.get("image");

  if (!title) {
    return NextResponse.json(
      { error: "invalid_fields", message: "Vui lòng nhập tiêu đề khuyến mãi." },
      { status: 400 }
    );
  }

  const currentPromotion = id ? await getPromotionById(id) : await getActivePromotion();
  let bannerImageUrl = currentPromotion?.banner_image_url ?? null;

  if (removeImage && bannerImageUrl) {
    await deleteImageByUrl(bannerImageUrl);
    bannerImageUrl = null;
  }

  if (imageFile instanceof File && imageFile.size > 0) {
    if (bannerImageUrl) await deleteImageByUrl(bannerImageUrl);
    const [uploaded] = await uploadImages([imageFile]);
    bannerImageUrl = uploaded;
  }

  const promotion = await upsertPromotion(
    {
      title,
      description,
      discount_text: discountText,
      is_active: isActive,
      banner_image_url: bannerImageUrl,
    },
    id
  );

  return NextResponse.json({ promotion });
}
