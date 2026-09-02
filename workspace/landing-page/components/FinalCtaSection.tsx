import { offer } from "@/lib/offer";
import { CtaButton } from "./CtaButton";

export function FinalCtaSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink mb-4">
          {offer.finalCta.headline}
        </h2>
        <p className="text-ink-soft mb-8">{offer.finalCta.body}</p>
        <CtaButton text={offer.cta.primary} />
      </div>
    </section>
  );
}
