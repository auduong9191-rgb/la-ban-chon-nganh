import { LeafIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border-soft bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
              <LeafIcon className="h-4 w-4" />
            </span>
            <span className="font-heading text-base font-semibold text-foreground">
              THẢO MỘC NHÀ THUỶ
            </span>
          </div>
          <p className="mt-2 text-sm text-primary-light">
            Thảo mộc lành – chăm sức khoẻ cả gia đình.
          </p>
        </div>

        <div>
          <p className="mb-2 font-heading text-sm font-semibold text-foreground">Liên hệ</p>
          <ul className="space-y-1 text-sm text-primary-light">
            <li>Hotline: 0989860606</li>
            <li>Zalo: 0989860606</li>
            <li>Fanpage: THẢO MỘC NHÀ THUỶ</li>
          </ul>
        </div>

        <div>
          <p className="mb-2 font-heading text-sm font-semibold text-foreground">Giao hàng</p>
          <p className="text-sm text-primary-light">
            Giao hàng toàn quốc. Phí vận chuyển tuỳ khu vực và giá trị đơn hàng, shop liên hệ xác
            nhận trước khi gửi.
          </p>
        </div>
      </div>
      <div className="border-t border-border-soft px-4 py-4 text-center text-xs text-primary-light">
        © {new Date().getFullYear()} THẢO MỘC NHÀ THUỶ.
      </div>
    </footer>
  );
}
