"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatVND } from "@/lib/format";
import { ImagePlaceholderIcon } from "@/components/icons";
import type { Product } from "@/lib/types";

export function ProductsAdmin({ adminPass }: { adminPass: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products", { headers: { "x-admin-pass": adminPass } });
    if (res.status === 503) {
      setNotConfigured(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProducts(data.products ?? []);
    setNotConfigured(false);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-primary-light">{products.length} sản phẩm</p>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark cursor-pointer"
        >
          {showAddForm ? "Đóng" : "+ Thêm sản phẩm"}
        </button>
      </div>

      {showAddForm && (
        <ProductForm
          adminPass={adminPass}
          onSaved={() => {
            setShowAddForm(false);
            load();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="mt-6 space-y-3">
        {products.length === 0 && (
          <p className="text-primary-light">Chưa có sản phẩm nào. Bấm &quot;+ Thêm sản phẩm&quot; để bắt đầu.</p>
        )}
        {products.map((p) => (
          <ProductRow key={p.id} product={p} adminPass={adminPass} onChanged={load} />
        ))}
      </div>
    </div>
  );
}

function ProductRow({
  product,
  adminPass,
  onChanged,
}: {
  product: Product;
  adminPass: string;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Xóa sản phẩm "${product.name}"? Không thể hoàn tác.`)) return;
    setBusy(true);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
      headers: { "x-admin-pass": adminPass },
    });
    onChanged();
  }

  async function handleToggleActive() {
    setBusy(true);
    const form = new FormData();
    form.set("is_active", String(!product.is_active));
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "x-admin-pass": adminPass },
      body: form,
    });
    onChanged();
  }

  if (editing) {
    return (
      <ProductForm
        adminPass={adminPass}
        product={product}
        onSaved={() => {
          setEditing(false);
          onChanged();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-soft bg-surface p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background">
        {product.image_urls[0] ? (
          <Image src={product.image_urls[0]} alt={product.name} fill unoptimized className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary-light">
            <ImagePlaceholderIcon className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{product.name}</p>
        <p className="text-sm text-primary-light">
          {product.category} ·{" "}
          {product.sale_price != null && product.sale_price < product.price ? (
            <>
              <span className="text-danger">{formatVND(product.sale_price)}</span>{" "}
              <span className="line-through">{formatVND(product.price)}</span>
            </>
          ) : (
            formatVND(product.price)
          )}{" "}
          · Kho: {product.stock_quantity}
        </p>
      </div>
      <button
        type="button"
        onClick={handleToggleActive}
        disabled={busy}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
          product.is_active ? "bg-success/10 text-success" : "bg-border-soft text-primary-light"
        }`}
      >
        {product.is_active ? "Đang hiển thị" : "Đã ẩn"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-accent transition-colors duration-200 hover:bg-background cursor-pointer"
      >
        Sửa
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-danger transition-colors duration-200 hover:bg-background cursor-pointer"
      >
        Xóa
      </button>
    </div>
  );
}

function ProductForm({
  adminPass,
  product,
  onSaved,
  onCancel,
}: {
  adminPass: string;
  product?: Product;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [salePrice, setSalePrice] = useState(product?.sale_price != null ? String(product.sale_price) : "");
  const [stock, setStock] = useState(product ? String(product.stock_quantity) : "0");
  const [description, setDescription] = useState(product?.description ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [removeUrls, setRemoveUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData();
    form.set("name", name);
    form.set("category", category);
    form.set("price", price);
    form.set("sale_price", salePrice);
    form.set("stock_quantity", stock);
    form.set("description", description);
    files.forEach((f) => form.append("images", f));
    if (product && removeUrls.length > 0) form.set("removeImageUrls", JSON.stringify(removeUrls));

    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const res = await fetch(url, {
      method: product ? "PATCH" : "POST",
      headers: { "x-admin-pass": adminPass },
      body: form,
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? "Có lỗi xảy ra.");
      setSaving(false);
      return;
    }

    onSaved();
  }

  const remainingImages = product?.image_urls.filter((u) => !removeUrls.includes(u)) ?? [];

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 space-y-3 rounded-2xl border border-border-soft bg-surface p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Tên sản phẩm" value={name} onChange={setName} required />
        <TextField label="Danh mục" value={category} onChange={setCategory} required />
        <TextField label="Giá (VNĐ)" value={price} onChange={setPrice} type="number" required />
        <TextField
          label="Giá khuyến mãi (bỏ trống nếu không giảm)"
          value={salePrice}
          onChange={setSalePrice}
          type="number"
        />
        <TextField label="Số lượng trong kho" value={stock} onChange={setStock} type="number" />
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Mô tả</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>

      {product && remainingImages.length > 0 && (
        <div>
          <span className="mb-1 block text-sm font-medium text-foreground">Ảnh hiện tại</span>
          <div className="flex flex-wrap gap-2">
            {remainingImages.map((url) => (
              <div
                key={url}
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-border-soft"
              >
                <Image src={url} alt="" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={() => setRemoveUrls((r) => [...r, url])}
                  aria-label="Xóa ảnh này"
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl bg-danger text-xs text-white cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">
          {product ? "Thêm ảnh mới" : "Ảnh sản phẩm"}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-primary-light"
        />
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-medium text-primary-light transition-colors duration-200 hover:bg-background cursor-pointer"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

function TextField({
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
        className="w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
      />
    </label>
  );
}
