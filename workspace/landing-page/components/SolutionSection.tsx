import Image from "next/image";
import { offer } from "@/lib/offer";

const FRAMEWORKS = [
  {
    src: "/ladame-diagram.jpg",
    alt: "Khung LADAME — Làm tốt, Mê thích, Đạt mục tiêu",
    name: "Khung LADAME",
  },
  {
    src: "/maslow-pyramid.jpg",
    alt: "Tháp Maslow — giải mã động lực nghề nghiệp theo nhu cầu của từng chỉ số linh hồn",
    name: "Tháp Maslow",
  },
  {
    src: "/quy-luat-gieo-hat.jpg",
    alt: "Quy luật Gieo Hạt — sự nghiệp bền vững đến từ Gieo - Dưỡng - Gặt",
    name: "Quy luật Gieo Hạt",
  },
];

export function SolutionSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
            {offer.solution.eyebrow}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink mb-6">
            {offer.solution.headline}
          </h2>
          <p className="text-ink-soft leading-relaxed">{offer.solution.body}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto mb-14">
          {FRAMEWORKS.map((fw) => (
            <div key={fw.src}>
              <Image
                src={fw.src}
                alt={fw.alt}
                width={600}
                height={330}
                className="w-full h-auto rounded-2xl shadow-md"
              />
              <p className="text-center text-sm font-medium text-primary-dark mt-3">
                {fw.name}
              </p>
            </div>
          ))}
        </div>

        <ol className="grid gap-6 sm:grid-cols-3">
          {offer.solution.steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl bg-surface border border-border-soft p-6"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-heading font-semibold mb-4">
                {index + 1}
              </span>
              <h3 className="font-heading text-lg font-semibold text-ink mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
