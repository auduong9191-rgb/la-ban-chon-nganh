import Image from "next/image";
import { offer } from "@/lib/offer";
import { CtaButton } from "./CtaButton";

export function Hero() {
  return (
    <section className="pt-14 pb-20 sm:pt-20 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="text-center lg:text-left">
          <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
            {offer.hero.eyebrow}
          </span>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6 mb-6">
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold leading-tight text-ink">
              {offer.hero.headline}
            </h1>
            <CtaButton text="Làm Bài Test Miễn Phí Cho Con →" />
          </div>
          <p className="text-lg leading-relaxed text-ink-soft max-w-xl mx-auto lg:mx-0 mb-10">
            {offer.hero.subheadline}
          </p>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto lg:mx-0">
            {offer.hero.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-heading text-2xl font-semibold text-primary-dark">
                  {stat.value}
                </dd>
                <p className="text-xs text-ink-soft mt-1">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <Image
            src="/career-map-book-mockup.jpg"
            alt="Career Map — Báo cáo định hướng nghề nghiệp"
            width={589}
            height={393}
            className="w-full h-auto rounded-2xl shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
}
