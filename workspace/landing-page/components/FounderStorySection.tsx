import { offer } from "@/lib/offer";

export function FounderStorySection() {
  const { founderStory } = offer;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
            {founderStory.eyebrow}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink">
            {founderStory.headline}
          </h2>
        </div>

        <blockquote className="rounded-2xl bg-surface border border-border-soft p-6 sm:p-10 text-left">
          <div className="space-y-4">
            {founderStory.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-ink leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          <footer className="text-sm font-medium text-primary-dark mt-6">
            — {offer.expert.name}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
