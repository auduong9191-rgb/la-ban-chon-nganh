import { offer } from "@/lib/offer";
import { CheckIcon } from "./icons";

export function BenefitsSection() {
  return (
    <section className="py-20 bg-surface border-y border-border-soft">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink text-center mb-14">
          Con sẽ nhận được gì?
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {offer.benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl bg-background border border-border-soft p-6"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-4">
                <CheckIcon className="w-5 h-5" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-ink mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
