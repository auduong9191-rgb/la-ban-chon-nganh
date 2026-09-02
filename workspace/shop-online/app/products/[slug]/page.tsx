import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { formatVND, getEffectivePrice } from "@/lib/format";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetailActions } from "@/components/ProductDetailActions";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage(
  props: PageProps<"/products/[slug]">
) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const onSale = product.sale_price != null && product.sale_price < product.price;
  const effectivePrice = getEffectivePrice(product);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.image_urls} alt={product.name} />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
            {product.category}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground">
            {product.name}
          </h1>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="font-heading text-3xl font-semibold text-accent">
              {formatVND(effectivePrice)}
            </p>
            {onSale && (
              <p className="text-lg text-primary-light line-through">{formatVND(product.price)}</p>
            )}
          </div>

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-primary-light">
              {product.description}
            </p>
          )}

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
    </main>
  );
}
