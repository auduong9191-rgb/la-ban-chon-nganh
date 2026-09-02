import { ImagePlaceholderIcon } from "@/components/icons";

export function AboutSection() {
  return (
    <section className="mb-12 rounded-2xl border border-border-soft bg-surface p-6 sm:p-8">
      <h2 className="mb-3 font-heading text-2xl font-semibold text-foreground">
        Về THẢO MỘC NHÀ THUỶ
      </h2>
      <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3 text-primary-light">
          <p>
            THẢO MỘC NHÀ THUỶ mang đến các sản phẩm thảo mộc tự nhiên phục vụ chăm sóc sức khoẻ
            chủ động và chăm sóc cơ thể hằng ngày — từ nguyên liệu có nguồn gốc rõ ràng, không qua
            nhập nguồn nguyên liệu thảo mộc ngoài.
          </p>
          <p>
            Chúng tôi tin rằng chăm sóc sức khoẻ không cần đợi đến lúc cơ thể lên tiếng, và cũng
            không cần chạy theo những lời quảng cáo &quot;thần kỳ&quot; — chỉ cần lựa chọn đúng
            những điều lành mạnh, phù hợp và duy trì đều đặn mỗi ngày.
          </p>
          {/* Placeholder — bổ sung câu chuyện thương hiệu đầy đủ, hình ảnh vườn trồng, quy trình sản xuất khi có nội dung. */}
          <p className="rounded-xl border border-dashed border-border-soft bg-background px-4 py-3 text-sm italic">
            Nội dung giới thiệu chi tiết hơn về thương hiệu (câu chuyện hình thành, vườn trồng,
            quy trình sản xuất...) sẽ được cập nhật.
          </p>
        </div>
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border-soft bg-background text-primary-light sm:aspect-auto">
          <div className="text-center">
            <ImagePlaceholderIcon className="mx-auto h-10 w-10" />
            <p className="mt-2 text-sm">Ảnh giới thiệu sẽ được cập nhật</p>
          </div>
        </div>
      </div>
    </section>
  );
}
