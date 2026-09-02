"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatVND } from "@/lib/format";

const GIFT_THRESHOLD = 500_000;

export default function CheckoutPage() {
  const { items, totalAmount, buyerInfo } = useCart();
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (buyerInfo) {
      setCustomerName(buyerInfo.name);
      setPhone(buyerInfo.phone);
    }
  }, [buyerInfo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const address = [addressDetail, ward, district, province].filter(Boolean).join(", ");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
          customerName,
          phone,
          address: note.trim() ? `${address} (Ghi chú: ${note.trim()})` : address,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
        setSubmitting(false);
        return;
      }

      router.push(`/checkout/${data.orderId}`);
    } catch {
      setError("Không thể kết nối tới server, vui lòng thử lại.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-primary-light">Giỏ hàng đang trống.</p>
        <Link href="/" className="mt-4 inline-block text-accent underline">
          Tiếp tục mua sắm
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-foreground">Thanh toán</h1>

      <div className="mb-6 rounded-2xl border border-border-soft bg-surface p-4">
        <ul className="divide-y divide-border-soft">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between py-2 text-sm">
              <span>
                {item.name} <span className="text-primary-light">x{item.qty}</span>
              </span>
              <span className="font-medium">{formatVND(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-border-soft pt-2 font-semibold">
          <span>Tổng cộng</span>
          <span className="font-heading text-lg text-accent">{formatVND(totalAmount)}</span>
        </div>
        {totalAmount >= GIFT_THRESHOLD && (
          <p className="mt-2 rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent-dark">
            🎁 Đơn hàng của bạn đủ điều kiện nhận quà tặng theo chương trình khuyến mãi hiện tại — shop sẽ
            xác nhận quà tặng khi liên hệ giao hàng.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Họ và tên" value={customerName} onChange={setCustomerName} required />
          <Field label="Số điện thoại" value={phone} onChange={setPhone} required type="tel" />
        </div>

        <p className="pt-2 text-sm font-medium text-foreground">Địa chỉ giao hàng</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tỉnh / Thành phố" value={province} onChange={setProvince} required />
          <Field label="Quận / Huyện" value={district} onChange={setDistrict} required />
          <Field label="Phường / Xã" value={ward} onChange={setWard} required />
          <Field
            label="Địa chỉ cụ thể (số nhà, tên đường)"
            value={addressDetail}
            onChange={setAddressDetail}
            required
          />
        </div>
        <Field label="Ghi chú (tuỳ chọn)" value={note} onChange={setNote} />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Đang xử lý..." : "Đặt hàng"}
        </button>
        <p className="text-center text-xs text-primary-light">
          Phí vận chuyển sẽ được shop liên hệ xác nhận riêng qua điện thoại.
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
      />
    </label>
  );
}
