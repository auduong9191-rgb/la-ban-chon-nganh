import Image from "next/image";
import { offer } from "@/lib/offer";

export function CertificatesSection() {
  const landscapeCerts = offer.expert.certificates.filter(
    (cert) => cert.orientation === "landscape"
  );
  const portraitCerts = offer.expert.certificates.filter(
    (cert) => cert.orientation === "portrait"
  );

  return (
    <section className="py-20 bg-surface border-y border-border-soft">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
            Chứng chỉ chuyên môn
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink">
            Được đào tạo và chứng nhận bài bản
          </h2>
        </div>

        <div className="space-y-10">
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {landscapeCerts.map((cert) => (
              <div key={cert.title} className="text-center">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border-soft shadow-sm mb-4">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <h3 className="font-heading text-sm font-semibold text-ink mb-1">
                  {cert.title}
                </h3>
                <p className="text-xs text-ink-soft">{cert.issuer}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {portraitCerts.map((cert) => (
              <div
                key={cert.title}
                className="text-center w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border-soft shadow-sm mb-4">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  />
                </div>
                <h3 className="font-heading text-sm font-semibold text-ink mb-1">
                  {cert.title}
                </h3>
                <p className="text-xs text-ink-soft">{cert.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
