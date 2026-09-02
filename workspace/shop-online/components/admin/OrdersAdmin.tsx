"use client";

import { useEffect, useMemo, useState } from "react";
import { formatVND } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

export function OrdersAdmin({ adminPass }: { adminPass: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders", { headers: { "x-admin-pass": adminPass } });
    if (res.status === 503) {
      setNotConfigured(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrders(data.orders ?? []);
    setNotConfigured(false);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPass]);

  async function handleMarkPaid(orderId: string) {
    setBusyId(orderId);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-pass": adminPass },
      body: JSON.stringify({ orderId }),
    });
    await load();
    setBusyId(null);
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q)
        );
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  if (loading) return <p className="text-primary-light">Đang tải...</p>;

  if (notConfigured) {
    return (
      <div className="rounded-2xl border border-border-soft bg-surface p-6 text-sm text-primary-light">
        Supabase chưa được cấu hình — chưa có đơn hàng nào để hiển thị.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn, tên, SĐT..."
          className="flex-1 rounded-xl border border-border-soft bg-surface px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
          className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chưa thanh toán</option>
          <option value="paid">Đã thanh toán</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-primary-light">Không có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-soft bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft text-left text-primary-light">
                <th className="px-4 py-3 font-medium">Mã đơn</th>
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">SĐT</th>
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th className="px-4 py-3 font-medium">Tổng tiền</th>
                <th className="px-4 py-3 font-medium">Địa chỉ</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                <th className="px-4 py-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.orderId} className="border-b border-border-soft last:border-0">
                  <td className="px-4 py-3 font-mono">{order.orderId}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{order.phone}</td>
                  <td className="px-4 py-3">{order.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
                  <td className="px-4 py-3 font-medium">{formatVND(order.totalAmount)}</td>
                  <td className="max-w-[16rem] px-4 py-3 text-primary-light">{order.address}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-medium ${
                        order.status === "paid"
                          ? "bg-success/10 text-success"
                          : "bg-border-soft text-primary-light"
                      }`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-primary-light">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    {order.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(order.orderId)}
                        disabled={busyId === order.orderId}
                        className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition-colors duration-200 hover:bg-success/20 disabled:opacity-60 cursor-pointer"
                      >
                        {busyId === order.orderId ? "Đang lưu..." : "Đánh dấu đã thanh toán"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
