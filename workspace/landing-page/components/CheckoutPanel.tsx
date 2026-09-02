"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";

type Status = "pending" | "paid" | "expired";

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function CheckoutPanel({
  orderId,
  email,
  bankName,
  bankAccount,
  initialAmount,
  initialStatus,
  initialQrUrl,
  hasVakad,
}: {
  orderId: string;
  email: string;
  bankName: string;
  bankAccount: string;
  initialAmount: number;
  initialStatus: Status;
  initialQrUrl: string | null;
  // null = đơn cũ chưa liên kết dữ liệu quiz — không hiện cảnh báo VAKAD.
  hasVakad: boolean | null;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [amount, setAmount] = useState(initialAmount);
  const [qrUrl, setQrUrl] = useState<string | null>(initialQrUrl);

  const [discountCode, setDiscountCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (status === "paid") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/${orderId}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "paid") {
          setStatus("paid");
        }
      } catch {
        // bỏ qua lỗi mạng tạm thời, poll tiếp ở lần sau
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId, status]);

  async function handleApplyDiscount(e: FormEvent) {
    e.preventDefault();
    const code = discountCode.trim();
    if (!code) return;
    setApplying(true);
    setDiscountError("");
    try {
      const res = await fetch(`/api/checkout/${orderId}/discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDiscountError(data.error ?? "Mã giảm giá không hợp lệ.");
        return;
      }
      setAmount(data.amount);
      setQrUrl(data.qrUrl);
      setAppliedCode(code.toUpperCase());
      if (data.status === "paid") {
        setStatus("paid");
      }
    } catch {
      setDiscountError("Không thể kết nối, vui lòng thử lại.");
    } finally {
      setApplying(false);
    }
  }

  const vakadNote = hasVakad === false && (
    <p className="text-xs text-ink-soft text-center mt-6">
      Lưu ý: báo cáo định hướng của con sẽ chính xác hơn nếu con làm thêm bài
      test Xu hướng Học tập (VAKAD).
    </p>
  );

  if (status === "paid") {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
          <h3 className="font-heading text-xl font-semibold text-green-800 mb-2">
            Đã nhận thanh toán!
          </h3>
          <p className="text-sm text-green-700">
            Tiara Edu sẽ gửi lại kết quả qua email trong{" "}
            <strong>24h</strong> tới:
          </p>
          <p className="text-sm font-semibold text-green-800 mt-1">{email}</p>
        </div>
        {vakadNote}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {qrUrl && amount > 0 && (
        <div className="rounded-2xl bg-surface border border-border-soft p-6 mb-6">
          <Image
            src={qrUrl}
            alt={`Mã QR thanh toán đơn hàng ${orderId}`}
            width={400}
            height={560}
            className="w-full h-auto rounded-lg"
            unoptimized
          />
        </div>
      )}

      <div className="rounded-2xl bg-surface border border-border-soft p-6 mb-6 space-y-2 text-sm">
        <Row label="Ngân hàng" value={bankName} />
        <Row label="Số tài khoản" value={bankAccount} mono />
        <Row label="Số tiền" value={formatVND(amount)} />
        <Row label="Nội dung chuyển khoản" value={orderId} mono />
        {appliedCode && (
          <Row label="Mã giảm giá" value={appliedCode} mono />
        )}
      </div>

      <form
        onSubmit={handleApplyDiscount}
        className="rounded-2xl bg-surface border border-border-soft p-4 mb-6"
      >
        <label className="block text-xs font-medium text-ink-soft mb-2">
          Mã giảm giá (nếu có)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Nhập mã giảm giá"
            className="flex-1 rounded-lg border border-border-soft px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={applying || !discountCode.trim()}
            className="rounded-lg bg-accent-dark hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {applying ? "Đang áp dụng..." : "Áp dụng"}
          </button>
        </div>
        {discountError && (
          <p className="text-sm text-red-600 mt-2" role="alert">
            {discountError}
          </p>
        )}
      </form>

      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 text-center">
        <p className="text-sm font-medium text-primary-dark animate-pulse">
          Đang chờ thanh toán... trang sẽ tự cập nhật khi nhận được tiền
        </p>
      </div>

      <p className="text-xs text-ink-soft text-center mt-6">
        Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận.
      </p>
      {vakadNote}
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-soft">{label}</span>
      <span className={`font-medium text-ink ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
