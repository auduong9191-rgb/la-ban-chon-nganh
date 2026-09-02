import { offer } from "@/lib/offer";
import { ShieldIcon } from "./icons";

export function UrgencySection() {
  return (
    <section className="pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-accent/5 border border-accent/20 p-8 sm:p-10 flex flex-col sm:flex-row gap-6 items-start">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-dark text-white shrink-0">
            <ShieldIcon className="w-7 h-7" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-ink mb-2">
              {offer.urgency.headline}
            </h2>
            <p className="text-ink-soft leading-relaxed">{offer.urgency.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
