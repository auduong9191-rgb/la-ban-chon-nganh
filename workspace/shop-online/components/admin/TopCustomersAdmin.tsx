"use client";

import { useEffect, useState } from "react";
import { formatVND } from "@/lib/format";

type TopCustomer = {
  phone: string;
  customerName: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

const MONTH_LABEL = new Date().toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

export function TopCustomersAdmin({ adminPass }: { adminPass: string }) {
  const [customers, setCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/admin/top-customers", { headers: { "x-admin-pass": adminPass } });
      if (res.status === 503) {
        setNotConfigured(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCustomers(data.customers ?? []);
      setLoading(false);
    })();
  }, [adminPass]);

  if (loading) return <p className="text-primary-light">Đang tải...</p>;

  if (notConfigured) {
    return (
      <div className="rounded-2xl border border-border-soft bg-surface p-6 text-sm text-primary-light">
        Supabase chưa được cấu hình. Xem hướng dẫn tại <code>supabase/README.md</code> rồi điền{" "}
        <code>SUPABASE_URL</code>/<code>SUPABASE_SECRET_KEY</code> vào <code>.env.local</code>.
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-primary-light">
        Top 10 khách mua nhiều nhất tháng {MONTH_LABEL} — tính theo số đơn <strong>đã thanh toán</strong>{" "}
        (đánh dấu ở tab &quot;Đơn hàng&quot;), gom theo số điện thoại.
      </p>

      {customers.length === 0 ? (
        <p className="text-primary-light">Chưa có đơn hàng đã thanh toán trong tháng này.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-soft bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft text-left text-primary-light">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Số điện thoại</th>
                <th className="px-4 py-3 font-medium">Tên khách (gần nhất)</th>
                <th className="px-4 py-3 font-medium">Số lần mua</th>
                <th className="px-4 py-3 font-medium">Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.phone} className="border-b border-border-soft last:border-0">
                  <td className="px-4 py-3 font-medium text-accent">{i + 1}</td>
                  <td className="px-4 py-3 font-mono">{c.phone}</td>
                  <td className="px-4 py-3">{c.customerName}</td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3 font-medium">{formatVND(c.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
