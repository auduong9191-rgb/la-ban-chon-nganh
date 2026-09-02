"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UnlockButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quiz/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizLeadId: leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
        setLoading(false);
        return;
      }
      router.push(`/checkout/${data.orderId}`);
    } catch {
      setError("Không thể kết nối, vui lòng thử lại.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-block rounded-full bg-white text-primary font-medium px-8 py-4 text-base hover:bg-white/90 disabled:opacity-70 transition-colors duration-200 cursor-pointer"
      >
        {loading ? "Đang tạo đơn hàng..." : "Nhận trọn bộ với 299.000đ →"}
      </button>
      {error && <p className="text-sm text-white/90 mt-3">{error}</p>}
    </div>
  );
}
