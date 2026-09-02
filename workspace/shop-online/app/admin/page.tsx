"use client";

import { useState } from "react";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { PromotionAdmin } from "@/components/admin/PromotionAdmin";
import { TopCustomersAdmin } from "@/components/admin/TopCustomersAdmin";

type Tab = "products" | "orders" | "promotion" | "top-customers";

const TABS: { key: Tab; label: string }[] = [
  { key: "products", label: "Sản phẩm" },
  { key: "orders", label: "Đơn hàng" },
  { key: "promotion", label: "Khuyến mãi" },
  { key: "top-customers", label: "Top khách hàng" },
];

export default function AdminPage() {
  const [pass, setPass] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [tab, setTab] = useState<Tab>("products");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(null);

    const res = await fetch("/api/admin/products", {
      headers: { "x-admin-pass": input },
    });

    if (res.status === 401) {
      setError("Mật khẩu không đúng.");
      setChecking(false);
      return;
    }

    setPass(input);
    setChecking(false);
  }

  if (!pass) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
        <h1 className="mb-4 text-center font-heading text-xl font-semibold text-foreground">
          Đăng nhập quản trị
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mật khẩu admin"
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-foreground outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={checking || !input}
            className="w-full rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-accent-dark disabled:opacity-60 cursor-pointer"
          >
            {checking ? "Đang kiểm tra..." : "Vào trang quản trị"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-foreground">Quản trị</h1>

      <div className="mb-6 flex gap-2 border-b border-border-soft">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
              tab === t.key
                ? "border-b-2 border-accent text-accent"
                : "text-primary-light hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductsAdmin adminPass={pass} />}
      {tab === "orders" && <OrdersAdmin adminPass={pass} />}
      {tab === "promotion" && <PromotionAdmin adminPass={pass} />}
      {tab === "top-customers" && <TopCustomersAdmin adminPass={pass} />}
    </main>
  );
}
