import Image from "next/image";
import { offer } from "@/lib/offer";

export function ExpertSection() {
  const { expert } = offer;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
          {expert.eyebrow}
        </span>

        <div className="flex flex-col items-center mb-6">
          <div className="w-48 sm:w-56 rounded-2xl overflow-hidden mb-4 shadow-md">
            <Image
              src="/au-thuy-duong.jpg"
              alt={expert.name}
              width={1950}
              height={1950}
              className="w-full h-auto"
            />
          </div>
          <h2 className="font-heading text-2xl font-semibold text-ink">
            {expert.name}
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            {expert.titles.join(" · ")}
          </p>
        </div>

        <p className="text-ink-soft leading-relaxed max-w-2xl mx-auto mb-8">
          {expert.bio}
        </p>

        <dl className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
          {expert.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-heading text-xl sm:text-2xl font-semibold text-primary-dark">
                {stat.value}
              </dd>
              <p className="text-xs text-ink-soft mt-1">{stat.label}</p>
            </div>
          ))}
        </dl>

        <blockquote className="rounded-2xl bg-surface border border-border-soft p-6 sm:p-8 text-left mb-14">
          <p className="text-ink italic leading-relaxed mb-3">
            &ldquo;{expert.quote}&rdquo;
          </p>
          <footer className="text-sm font-medium text-primary-dark">
            — {expert.name}
          </footer>
        </blockquote>

        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 sm:p-8 text-left">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image
                src="/gein-academy-logo.jpg"
                alt="Gein Academy"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-xs font-medium px-3 py-1">
              {expert.aboutGein.eyebrow}
            </span>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-semibold text-ink mb-3">
            {expert.aboutGein.headline}
          </h3>
          <p className="text-ink-soft leading-relaxed mb-6">
            {expert.aboutGein.body}
          </p>
          <dl className="grid grid-cols-3 gap-4">
            {expert.aboutGein.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-heading text-lg sm:text-xl font-semibold text-primary-dark">
                  {stat.value}
                </dd>
                <p className="text-xs text-ink-soft mt-1">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
