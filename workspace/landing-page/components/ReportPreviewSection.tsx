import Image from "next/image";

export function ReportPreviewSection() {
  return (
    <section className="py-20 bg-surface border-y border-border-soft">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <span className="inline-block rounded-full bg-primary/10 text-primary-dark text-sm font-medium px-4 py-1.5 mb-6">
          Xem trước bên trong báo cáo
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink mb-10">
          Không phải vài dòng nhận xét chung chung
        </h2>
        <Image
          src="/career-map-pages-preview.jpg"
          alt="Xem trước các trang bên trong báo cáo Career Map"
          width={600}
          height={320}
          className="w-full h-auto rounded-2xl shadow-lg mb-10"
        />

        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="relative rounded-lg shadow-lg border border-border-soft overflow-hidden">
              <Image
                src="/report-preview-detail-3.jpg"
                alt="Trang bìa báo cáo Chiến lược chọn ngành chọn trường cá nhân hoá"
                width={1080}
                height={1521}
                className="w-full h-auto"
              />
              <div className="absolute left-[18%] right-[18%] top-[53%] h-[9%] rounded-md backdrop-blur-md bg-background/30" />
            </div>
            <Image
              src="/report-preview-detail-1.jpg"
              alt="Trang chi tiết học phí và phương thức xét tuyển trong báo cáo Career Map"
              width={1080}
              height={1476}
              className="w-full h-auto rounded-lg shadow-md border border-border-soft"
            />
            <Image
              src="/report-preview-detail-2.jpg"
              alt="Trang ma trận chuyên ngành và điểm chuẩn trong báo cáo Career Map"
              width={1080}
              height={1721}
              className="w-full h-auto rounded-lg shadow-md border border-border-soft"
            />
          </div>
          <p className="text-xs text-ink-soft mt-3">
            Mỗi báo cáo được biên soạn riêng theo tên và kết quả của từng học sinh.
          </p>
        </div>
      </div>
    </section>
  );
}
