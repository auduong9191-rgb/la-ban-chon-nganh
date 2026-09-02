import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:px-0">
      {products.map((product) => (
        <div key={product.id} className="w-40 shrink-0 sm:w-48">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
