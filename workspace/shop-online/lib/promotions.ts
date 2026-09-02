import "server-only";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { Promotion } from "@/lib/types";

export const isPromotionsConfigured = isSupabaseConfigured;

export async function getActivePromotion(): Promise<Promotion | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getActivePromotion] supabase error:", error.message);
    return null;
  }
  return data ?? null;
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("promotions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getPromotionById] supabase error:", error.message);
    return null;
  }
  return data ?? null;
}

export type PromotionInput = {
  title: string;
  description: string | null;
  discount_text: string | null;
  is_active: boolean;
  banner_image_url: string | null;
};

/** Cập nhật khuyến mãi hiện tại — nếu chưa có hàng nào thì tạo mới. */
export async function upsertPromotion(input: PromotionInput, id?: string): Promise<Promotion> {
  if (!supabaseAdmin) throw new Error("Supabase chưa được cấu hình");

  const payload = { ...input, updated_at: new Date().toISOString() };

  if (id) {
    const { data, error } = await supabaseAdmin
      .from("promotions")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("promotions")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
