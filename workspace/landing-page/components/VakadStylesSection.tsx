import { offer } from "@/lib/offer";

export function VakadStylesSection() {
  return (
    <section className="py-20 bg-surface border-y border-border-soft">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
            Bài test VAKAD giải mã điều gì
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink mb-4">
            Học sai cách tiếp thu kiến thức, con dễ &ldquo;học nhiều nhưng không vào&rdquo;
          </h2>
          <p className="text-ink-soft leading-relaxed">
            Ở độ tuổi 15-18, áp lực kiến thức rất lớn. Nếu học sai phong cách VAKAD
            bẩm sinh, con rất dễ rơi vào trạng thái kiệt sức, trì hoãn.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {offer.vakadStyles.map((style) => (
            <div
              key={style.group}
              className="rounded-2xl bg-background border border-border-soft p-6"
            >
              <span className="text-3xl mb-4 block">{style.icon}</span>
              <h3 className="font-heading text-lg font-semibold text-ink mb-2">
                {style.group}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                {style.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-primary-dark font-medium mt-10 max-w-2xl mx-auto">
          Giải mã đúng VAKAD = Con tìm lại hứng thú học tập, tự giác luyện đề,
          bứt phá điểm số mà không cần bố mẹ nhắc nhở.
        </p>
      </div>
    </section>
  );
}
