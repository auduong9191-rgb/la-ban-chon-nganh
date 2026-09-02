import { getActiveProducts, getFeaturedDeals, getNewArrivals } from "@/lib/products";
import { getActivePromotion } from "@/lib/promotions";
import { ProductGrid } from "@/components/ProductGrid";
import { HomeProductSection } from "@/components/HomeProductSection";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { PromoBanner } from "@/components/PromoBanner";
import { FlameIcon, SparkleIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, promotion] = await Promise.all([getActiveProducts(), getActivePromotion()]);
  const deals = getFeaturedDeals(products);
  const newArrivals = getNewArrivals(products);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Hero />

      <PromoBanner promotion={promotion} />

      <AboutSection />

      <HomeProductSection
        title="Sản phẩm hot theo ngày"
        icon={<FlameIcon />}
        iconClassName="bg-danger/10 text-danger"
        products={deals}
      />

      <HomeProductSection
        title="Hàng mới về"
        icon={<SparkleIcon />}
        iconClassName="bg-accent/10 text-accent"
        products={newArrivals}
      />

      <section id="danh-muc-san-pham">
        <h2 className="mb-6 font-heading text-2xl font-semibold text-foreground">
          Danh mục sản phẩm
        </h2>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
