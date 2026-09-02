import { ProductCarousel } from "@/components/ProductCarousel";
import type { Product } from "@/lib/types";

export function HomeProductSection({
  title,
  icon,
  iconClassName = "bg-primary/10 text-primary",
  products,
}: {
  title: string;
  icon: React.ReactNode;
  iconClassName?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${iconClassName}`}>
          {icon}
        </span>
        <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}
