"use client";

import { useQuickView } from "@/components/QuickViewProvider";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { CloseIcon } from "@/components/icons";
import { formatVND, getEffectivePrice } from "@/lib/format";

export function ProductQuickView() {
  const { activeProduct, closeQuickView } = useQuickView();

  if (!activeProduct) return null;

  const product = activeProduct;
  const onSale = product.sale_price != null && product.sale_price < product.price;
  const effectivePrice = getEffectivePrice(product);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeQuickView}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-surface p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={closeQuickView}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors duration-200 hover:bg-background cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ProductGallery images={product.image_urls} alt={product.name} />

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
              {product.category}
            </p>
            <h2 className="mt-1 font-heading text-xl font-semibold text-foreground">
              {product.name}
            </h2>
            <div className="mt-3 flex items-baseline gap-3">
              <p className="font-heading text-2xl font-semibold text-accent">
                {formatVND(effectivePrice)}
              </p>
              {onSale && (
                <p className="text-base text-primary-light line-through">
                  {formatVND(product.price)}
                </p>
              )}
            </div>

            <p className="mt-4 whitespace-pre-line text-primary-light">
              {product.description || "Thông tin chi tiết sản phẩm đang được cập nhật."}
            </p>

            <div className="mt-6">
              <ProductDetailActions product={product} />
            </div>

            <p className="mt-4 text-sm text-primary-light">
              {product.stock_quantity > 0
                ? `Còn ${product.stock_quantity} sản phẩm trong kho`
                : "Hiện đã hết hàng"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
