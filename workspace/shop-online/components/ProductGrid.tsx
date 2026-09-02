"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const ALL = "Tất cả";

export function ProductGrid({ products }: { products: Product[] }) {
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products]
  );
  const [active, setActive] = useState(ALL);

  const filtered = active === ALL ? products : products.filter((p) => p.category === active);

  return (
    <div>
      {categories.length > 2 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                active === cat
                  ? "bg-primary text-white"
                  : "bg-surface text-primary border border-border-soft hover:bg-background"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-primary-light">
          Chưa có sản phẩm nào{active !== ALL ? ` trong danh mục "${active}"` : ""}.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
