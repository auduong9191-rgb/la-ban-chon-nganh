"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { CloseIcon } from "@/components/icons";

const PHONE_PATTERN = /^0\d{9,10}$/;

export function BuyerInfoModal() {
  const { isBuyerModalOpen, closeBuyerModal, confirmBuyerInfo } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isBuyerModalOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!PHONE_PATTERN.test(phone.trim())) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }
    confirmBuyerInfo({ name: name.trim(), phone: phone.trim() });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Thông tin của bạn
          </h2>
          <button
            type="button"
            onClick={closeBuyerModal}
            aria-label="Đóng"
            className="text-primary-light transition-colors duration-200 hover:text-foreground cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-primary-light">
          Nhập họ tên và số điện thoại để tiếp tục mua hàng — không cần đăng ký hay đăng nhập.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">Họ và tên</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">Số điện thoại</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className="w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-accent-dark cursor-pointer"
          >
            Tiếp tục mua hàng
          </button>
        </form>
      </div>
    </div>
  );
}
