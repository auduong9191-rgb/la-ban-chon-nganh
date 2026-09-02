import Image from "next/image";
import { SparkleIcon } from "@/components/icons";
import type { Promotion } from "@/lib/types";

export function PromoBanner({ promotion }: { promotion: Promotion | null }) {
  if (!promotion) return null;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-accent/20 bg-accent/10">
      {promotion.banner_image_url && (
        <div className="relative aspect-[3/1] w-full bg-background sm:aspect-[4/1]">
          <Image
            src={promotion.banner_image_url}
            alt={promotion.title}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
      <div className="flex items-start gap-3 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <SparkleIcon />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">{promotion.title}</h2>
          {promotion.discount_text && (
            <p className="mt-0.5 text-sm font-semibold text-accent-dark">
              {promotion.discount_text}
            </p>
          )}
          {promotion.description && (
            <p className="mt-1 text-sm text-primary-light">{promotion.description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
