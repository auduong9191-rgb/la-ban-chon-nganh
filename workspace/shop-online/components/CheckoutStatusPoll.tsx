"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import type { OrderStatus } from "@/lib/types";

const POLL_INTERVAL_MS = 4000;

export function CheckoutStatusPoll({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const router = useRouter();
  const { clear } = useCart();

  useEffect(() => {
    if (status === "paid") {
      clear();
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/${orderId}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "paid") {
          setStatus("paid");
          router.refresh();
        }
      } catch {
        // Bỏ qua lỗi mạng tạm thời, sẽ thử lại ở lần poll kế tiếp.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, status]);

  if (status === "paid") {
    return (
      <div className="rounded-2xl bg-success/10 px-6 py-4 text-center text-success">
        <p className="font-heading text-lg font-semibold">Đã nhận thanh toán!</p>
        <p className="mt-1 text-sm">Shop sẽ liên hệ để xác nhận giao hàng.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-primary-light">
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
      Đang chờ thanh toán...
    </div>
  );
}
