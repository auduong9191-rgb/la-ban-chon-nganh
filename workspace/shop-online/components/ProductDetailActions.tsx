"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { getEffectivePrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const { addItem, open } = useCart();
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock_quantity <= 0;
  const effectivePrice = getEffectivePrice(product);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-xl border border-border-soft px-2 py-1">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Giảm số lượng"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors duration-200 hover:bg-background cursor-pointer"
        >
          <MinusIcon />
        </button>
        <span className="w-8 text-center">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          aria-label="Tăng số lượng"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors duration-200 hover:bg-background cursor-pointer"
        >
          <PlusIcon />
        </button>
      </div>
      <button
        type="button"
        disabled={outOfStock}
        onClick={() => {
          addItem(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: effectivePrice,
              imageUrl: product.image_urls[0] ?? null,
            },
            qty
          );
          open();
        }}
        className="flex-1 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-border-soft disabled:text-primary-light cursor-pointer"
      >
        {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
      </button>
    </div>
  );
}
