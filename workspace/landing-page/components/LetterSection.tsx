import Image from "next/image";
import { offer } from "@/lib/offer";

export function LetterSection() {
  const { letter } = offer;

  return (
    <section className="py-20 bg-surface border-y border-border-soft">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
            {letter.eyebrow}
          </span>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-8 lg:gap-10 items-start">
          <div className="lg:sticky lg:top-24">
            <Image
              src="/career-map-english-launch.jpg"
              alt="Career Map phiên bản tiếng Anh đã ra mắt"
              width={447}
              height={447}
              className="w-full h-auto rounded-2xl shadow-lg border border-border-soft"
            />
          </div>

          <blockquote className="rounded-2xl bg-background border border-border-soft p-6 sm:p-10 text-left">
            <p className="font-handwriting text-2xl sm:text-3xl italic text-ink mb-4">
              {letter.salutation}
            </p>
            <div className="space-y-4">
              {letter.paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="font-handwriting italic text-xl sm:text-2xl leading-relaxed text-ink-soft"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <footer className="mt-6">
              <p className="font-handwriting italic text-2xl sm:text-3xl text-ink">
                {letter.signatureName}
              </p>
              <p className="text-sm text-ink-soft">{letter.signatureFull}</p>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
