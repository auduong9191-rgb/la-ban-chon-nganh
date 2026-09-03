// Pure helpers cho Sepay integration — không dependency framework.
// Reusable cho /api/checkout, /api/sepay-webhook, server components.

import { timingSafeEqual } from "crypto";

export function generateVietQRUrl(opts: {
  accountNumber: string;
  bank: string;
  amount: number;
  content: string;
  template?: "compact" | "qronly" | "";
}): string {
  // VietinBank chỉ đẩy thông báo biến động số dư sang Sepay nếu nội dung
  // chuyển khoản bắt đầu bằng "SEVQR" (yêu cầu riêng của VietinBank, xem
  // cảnh báo trên dashboard Sepay > Ngân hàng > VietinBank).
  const content =
    opts.bank === "VietinBank" ? `SEVQR ${opts.content}` : opts.content;
  const params = new URLSearchParams({
    acc: opts.accountNumber,
    bank: opts.bank,
    amount: String(Math.floor(opts.amount)),
    des: content,
  });
  if (opts.template) params.set("template", opts.template);
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

/**
 * Parse order ID dạng "DH<digits>" từ content khách dán khi chuyển khoản.
 * Return: normalized order ID "DH000123" (uppercase, no space) hoặc null.
 */
export function parseOrderIdFromContent(content: string): string | null {
  if (!content) return null;
  const match = content.match(/DH\s*(\d{1,10})/i);
  if (!match) return null;
  const digits = match[1].padStart(6, "0");
  return `DH${digits}`;
}

/**
 * Verify Sepay webhook auth header. Support cả "Apikey" và "Bearer" format.
 * Timing-safe comparison để chống timing attack.
 */
export function verifySepayAuth(
  authHeader: string | null,
  expectedKey: string
): boolean {
  if (!authHeader || !expectedKey) return false;

  let providedKey: string;
  if (authHeader.startsWith("Apikey ")) {
    providedKey = authHeader.slice(7);
  } else if (authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.slice(7);
  } else {
    return false;
  }

  try {
    const expected = Buffer.from(expectedKey);
    const provided = Buffer.from(providedKey);
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function generateOrderId(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return `DH${String(n).padStart(6, "0")}`;
}

export type SepayWebhookPayload = {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
  referenceCode: string;
  description?: string;
};
