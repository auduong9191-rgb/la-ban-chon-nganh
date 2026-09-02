import { LeafIcon, ImagePlaceholderIcon } from "@/components/icons";

export function Hero() {
  return (
    <section className="mb-10 grid gap-6 sm:grid-cols-[1.1fr_1fr] sm:items-center">
      <div>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-dark">
          <LeafIcon className="h-3.5 w-3.5" />
          100% thảo mộc tự nhiên
        </span>
        <h1 className="font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          THẢO MỘC NHÀ THUỶ
        </h1>
        <p className="mt-2 font-heading text-lg text-accent-dark">
          Thảo mộc lành – chăm sức khoẻ cả gia đình
        </p>
        <p className="mt-4 max-w-md text-primary-light">
          Không chạy theo những lời quảng cáo &quot;thần kỳ&quot; — chỉ lựa chọn những điều lành
          mạnh, phù hợp và duy trì đều đặn mỗi ngày, để cả nhà chủ động chăm sóc sức khoẻ từ những
          điều nhỏ nhất.
        </p>
        <a
          href="#danh-muc-san-pham"
          className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-accent-dark"
        >
          Xem sản phẩm
        </a>
      </div>

      {/* Ảnh bìa thương hiệu — thay bằng ảnh thật khi shop cung cấp. */}
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-border-soft bg-surface text-primary-light">
        <div className="text-center">
          <ImagePlaceholderIcon className="mx-auto h-10 w-10" />
          <p className="mt-2 text-sm">Ảnh bìa sẽ được cập nhật</p>
        </div>
      </div>
    </section>
  );
}
