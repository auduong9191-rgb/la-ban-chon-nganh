import { offer } from "@/lib/offer";
import { XIcon } from "./icons";

export function ProblemSection() {
  return (
    <section className="py-20 bg-surface border-y border-border-soft">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-12">
          Con có đang gặp phải
        </span>

        <ul className="space-y-4 text-left max-w-2xl mx-auto mb-12">
          {offer.pains.map((pain) => (
            <li
              key={pain}
              className="flex gap-4 rounded-xl bg-background border border-border-soft p-5"
            >
              <XIcon className="w-5 h-5 shrink-0 text-accent mt-0.5" />
              <span className="text-ink-soft leading-relaxed">{pain}</span>
            </li>
          ))}
        </ul>

        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink">
          Vấn đề không nằm ở việc con chưa cố gắng đủ
        </h2>
      </div>
    </section>
  );
}
