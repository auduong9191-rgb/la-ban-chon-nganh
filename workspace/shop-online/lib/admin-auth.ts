import "server-only";
import { timingSafeEqual } from "crypto";

/** So sánh timing-safe với ADMIN_PASSWORD env — dùng chung cho mọi API /api/admin/*. */
export function checkAdminPass(input: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(input, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
