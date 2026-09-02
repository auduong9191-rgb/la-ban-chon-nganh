"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Promotion } from "@/lib/types";

export function PromotionAdmin({ adminPass }: { adminPass: string }) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/admin/promotion", { headers: { "x-admin-pass": adminPass } });
      if (res.status === 503) {
        setNotConfigured(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const p: Promotion | null = data.promotion ?? null;
      setPromotion(p);
      setTitle(p?.title ?? "");
      setDescription(p?.description ?? "");
      setDiscountText(p?.discount_text ?? "");
      setIsActive(p?.is_active ?? true);
      setBannerImageUrl(p?.banner_image_url ?? null);
      setLoading(false);
    })();
  }, [adminPass]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData();
    if (promotion?.id) form.set("id", promotion.id);
    form.set("title", title);
    form.set("description", description);
    form.set("discount_text", discountText);
    form.set("is_active", String(isActive));
    if (removeImage) form.set("removeImage", "true");
    if (file) form.set("image", file);

    const res = await fetch("/api/admin/promotion", {
      method: "PUT",
      headers: { "x-admin-pass": adminPass },
      body: form,
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? "Có lỗi xảy ra.");
      setSaving(false);
      return;
    }

    setPromotion(data.promotion);
    setBannerImageUrl(data.promotion?.banner_image_url ?? null);
    setFile(null);
    setRemoveImage(false);
    setSaving(false);
    setSavedAt(Date.now());
  }

  if (loading) return <p className="text-primary-light">Đang tải...</p>;

  if (notConfigured) {
    return (
      <div className="rounded-2xl border border-border-soft bg-surface p-6 text-sm text-primary-light">
        Supabase chưa được cấu hình. Xem hướng dẫn tại <code>supabase/README.md</code> rồi điền{" "}
        <code>SUPABASE_URL</code>/<code>SUPABASE_SECRET_KEY</code> vào <code>.env.local</code>.
      </div>
    );
  }

  const showCurrentImage = bannerImageUrl && !removeImage;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4 rounded-2xl border border-border-soft bg-surface p-5"
    >
      <p className="text-sm text-primary-light">
        Nội dung này hiển thị dạng banner khuyến mãi ở trang chính và trang thanh toán.
      </p>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">
          Ảnh banner (khuyến khích ảnh ngang, ví dụ 1200×450)
        </span>
        {showCurrentImage && (
          <div className="relative mb-2 aspect-[8/3] w-full overflow-hidden rounded-xl border border-border-soft bg-background">
            <Image src={bannerImageUrl} alt="Banner khuyến mãi" fill unoptimized className="object-cover" />
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              className="absolute right-2 top-2 rounded-lg bg-danger px-2 py-1 text-xs font-medium text-white cursor-pointer"
            >
              Xóa ảnh
            </button>
          </div>
        )}
        {file && (
          <p className="mb-2 text-xs text-primary-light">Ảnh mới sẽ thay ảnh hiện tại: {file.name}</p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setRemoveImage(false);
          }}
          className="block w-full text-sm text-primary-light"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Tiêu đề</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">
          Dòng nhấn mạnh (hiện nổi bật trên banner)
        </span>
        <input
          value={discountText}
          onChange={(e) => setDiscountText(e.target.value)}
          placeholder="Ví dụ: Miễn phí quà tặng cho đơn từ 500.000đ"
          className="w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Mô tả chi tiết</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-border-soft bg-background px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        Đang áp dụng (hiển thị công khai)
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Đang lưu..." : "Lưu khuyến mãi"}
        </button>
        {savedAt && <span className="text-sm text-success">Đã lưu.</span>}
      </div>
    </form>
  );
}
