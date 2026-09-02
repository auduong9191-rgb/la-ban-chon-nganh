"use client";

import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { useQuickView } from "@/components/QuickViewProvider";
import { formatVND, getEffectivePrice } from "@/lib/format";
import { ImagePlaceholderIcon } from "@/components/icons";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { openQuickView } = useQuickView();
  const imageUrl = product.image_urls[0] ?? null;
  const outOfStock = product.stock_quantity <= 0;
  const onSale = product.sale_price != null && product.sale_price < product.price;
  const effectivePrice = getEffectivePrice(product);

  return (
    <div className="group overflow-hidden rounded-2xl border border-border-soft bg-surface transition-transform duration-200 hover:scale-[1.02]">
      <button
        type="button"
        onClick={() => openQuickView(product)}
        className="block w-full cursor-pointer text-left"
      >
        <div className="relative aspect-square bg-background">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary-light">
              <ImagePlaceholderIcon className="w-10 h-10" />
            </div>
          )}
          {onSale && (
            <span className="absolute left-3 top-3 rounded-full bg-danger px-2 py-1 text-xs font-semibold text-white">
              -{Math.round((1 - product.sale_price! / product.price) * 100)}%
            </span>
          )}
          {outOfStock && (
            <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
              Hết hàng
            </span>
          )}
        </div>
      </button>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
          {product.category}
        </p>
        <button type="button" onClick={() => openQuickView(product)} className="cursor-pointer text-left">
          <h3 className="mt-1 line-clamp-2 font-medium text-foreground">{product.name}</h3>
        </button>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="font-heading text-lg font-semibold text-accent">
            {formatVND(effectivePrice)}
          </p>
          {onSale && (
            <p className="text-sm text-primary-light line-through">{formatVND(product.price)}</p>
          )}
        </div>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: effectivePrice,
              imageUrl,
            })
          }
          className="mt-3 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-border-soft disabled:text-primary-light cursor-pointer"
        >
          {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
}
