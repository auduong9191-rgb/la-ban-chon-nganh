import "server-only";
import { supabaseAdmin } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export async function getActiveProducts(): Promise<Product[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getActiveProducts] supabase error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[getProductBySlug] supabase error:", error.message);
    return null;
  }
  return data ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!supabaseAdmin || ids.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) {
    console.error("[getProductsByIds] supabase error:", error.message);
    return [];
  }
  return data ?? [];
}

export function getFeaturedDeals(products: Product[]): Product[] {
  return products.filter((p) => p.sale_price != null && p.sale_price < p.price);
}

export function getNewArrivals(products: Product[], limit = 12): Product[] {
  // products đã được order theo created_at desc từ getActiveProducts, chỉ cần cắt lấy N đầu.
  return products.slice(0, limit);
}
