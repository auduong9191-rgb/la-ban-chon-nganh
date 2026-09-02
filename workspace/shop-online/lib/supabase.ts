import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

/** false khi chưa điền SUPABASE_* trong .env.local — cho phép app chạy ở dạng
 * "landing trống" (empty state) trước khi Supabase được setup, xem supabase/README.md. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseSecretKey);

export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseSecretKey!, { auth: { persistSession: false } })
  : null;

export const PRODUCT_IMAGES_BUCKET = "product-images";
