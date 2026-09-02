import { offer, formatVnd } from "@/lib/offer";
import { CheckIcon } from "./icons";
import { CtaButton } from "./CtaButton";

export function OfferStackSection() {
  const standardTier = offer.pricing.tiers.find((t) => t.isRecommended)!;
  const freeItems = offer.bonusStack.filter((item) => item.isFree);
  const paidItems = offer.bonusStack.filter((item) => !item.isFree);

  return (
    <section className="py-20 bg-surface border-y border-border-soft">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink mb-4">
            Toàn bộ những gì con nhận được
          </h2>
        </div>

        {/* Stack display */}
        <div className="rounded-2xl bg-background border border-border-soft p-6 sm:p-10 max-w-2xl mx-auto mb-16">
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 mb-6">
            <span className="inline-block rounded-full bg-primary text-white text-xs font-medium px-3 py-1 mb-3">
              Miễn phí — nhận ngay
            </span>
            <ul className="space-y-3">
              {freeItems.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                  <span className="text-sm sm:text-base text-ink">
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <span className="inline-block rounded-full bg-accent-dark text-white text-xs font-medium px-3 py-1 mb-3">
            Mở khoá cùng 299.000đ
          </span>
          <ul className="space-y-4">
            {paidItems.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm sm:text-base text-ink">
                  {item.name}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t-2 border-dashed border-border-soft text-center">
            <p className="text-sm text-ink-soft mb-2">
              {offer.pricing.giftNote}
            </p>
            <span className="font-heading text-3xl font-bold text-accent">
              {formatVnd(standardTier.priceVnd)}
            </span>
          </div>
        </div>

        {/* Pricing tiers */}
        <div
          className={`grid gap-6 ${
            offer.pricing.tiers.length > 1
              ? "lg:grid-cols-3"
              : "max-w-md mx-auto"
          }`}
        >
          {offer.pricing.tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 border flex flex-col ${
                tier.isRecommended
                  ? "border-accent bg-background shadow-lg"
                  : "border-border-soft bg-background"
              }`}
            >
              {tier.isRecommended && (
                <span className="self-start rounded-full bg-accent-dark text-white text-xs font-medium px-3 py-1 mb-4">
                  Phổ biến nhất
                </span>
              )}
              <h3 className="font-heading text-xl font-semibold text-ink mb-1">
                {tier.name}
              </h3>
              <p className="font-heading text-2xl font-bold text-ink mb-1">
                {formatVnd(tier.priceVnd)}
              </p>
              <p className="text-xs text-primary-dark font-medium mb-4">
                {offer.pricing.giftNote}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.includes.map((line) => (
                  <li key={line} className="flex gap-2 text-sm text-ink-soft">
                    <CheckIcon className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-soft mb-4">{tier.recommendedFor}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <CtaButton text={offer.cta.primary} />
          <p className="text-xs text-ink-soft mt-3">
            {offer.guarantee.headline} — {offer.guarantee.body}
          </p>
        </div>
      </div>
    </section>
  );
}
