import { offer } from "@/lib/offer";

export function ReportsOverviewSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
            {offer.reportsOverview.eyebrow}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink mb-6">
            {offer.reportsOverview.headline}
          </h2>
          <p className="text-ink-soft leading-relaxed">{offer.reportsOverview.body}</p>
        </div>

        <ol className="grid gap-6 sm:grid-cols-3">
          {offer.reportsOverview.items.map((item, index) => (
            <li
              key={item.name}
              className="rounded-2xl bg-surface border border-border-soft p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-heading font-semibold shrink-0">
                  {index + 1}
                </span>
                <span className="text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="rounded-full bg-primary/10 text-primary-dark text-xs font-medium px-2.5 py-1">
                  {item.tag}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-ink mb-2">
                {item.name}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
