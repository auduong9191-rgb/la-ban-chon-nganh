import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrder } from "@/lib/orders";
import { generateVietQRUrl, isSepayConfigured } from "@/lib/sepay";
import { formatVND } from "@/lib/format";
import { CheckoutStatusPoll } from "@/components/CheckoutStatusPoll";

export const dynamic = "force-dynamic";

const GIFT_THRESHOLD = 500_000;

export default async function CheckoutOrderPage(
  props: PageProps<"/checkout/[orderId]">
) {
  const { orderId } = await props.params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  const bankAccount = process.env.SEPAY_BANK_ACCOUNT_NUMBER;
  const bankName = process.env.SEPAY_BANK_NAME;
  const bankHolder = process.env.SEPAY_BANK_ACCOUNT_HOLDER;

  const qrUrl =
    isSepayConfigured && bankAccount && bankName
      ? generateVietQRUrl({
          accountNumber: bankAccount,
          bank: bankName,
          amount: order.totalAmount,
          content: order.orderId,
          template: "compact",
        })
      : null;

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-md">
        <h1 className="text-center font-heading text-2xl font-semibold text-foreground mb-1">
          {order.status === "paid" ? "Đơn hàng đã thanh toán" : "Quét mã để thanh toán"}
        </h1>
        <p className="mb-8 text-center text-sm text-primary-light">
          Đơn hàng {order.orderId} — {order.items.length} sản phẩm
        </p>

        {qrUrl ? (
          <div className="mb-6 rounded-2xl border border-border-soft bg-surface p-6">
            <Image
              src={qrUrl}
              alt={`Mã QR thanh toán đơn hàng ${order.orderId}`}
              width={400}
              height={560}
              unoptimized
              className="h-auto w-full rounded-lg"
            />
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-border-soft bg-surface p-6 text-center text-sm text-primary-light">
            Vui lòng chuyển khoản theo thông tin bên dưới, sau đó nhắn Zalo/Hotline{" "}
            <span className="font-medium text-foreground">0989860606</span> kèm ảnh chụp chuyển khoản
            và mã đơn <span className="font-mono font-medium text-foreground">{order.orderId}</span> để
            shop xác nhận đơn nhanh nhất.
          </div>
        )}

        <div className="mb-6 space-y-2 rounded-2xl border border-border-soft bg-surface p-6 text-sm">
          {bankName && <Row label="Ngân hàng" value={bankName} />}
          {bankAccount && <Row label="Số tài khoản" value={bankAccount} mono />}
          {bankHolder && <Row label="Chủ tài khoản" value={bankHolder} />}
          <Row label="Số tiền" value={formatVND(order.totalAmount)} />
          <Row label="Nội dung chuyển khoản" value={order.orderId} mono />
        </div>

        {order.totalAmount >= GIFT_THRESHOLD && (
          <div className="mb-6 rounded-2xl bg-accent/10 px-5 py-4 text-center text-sm text-accent-dark">
            🎁 Đơn hàng đủ điều kiện nhận quà tặng theo chương trình khuyến mãi — shop sẽ xác nhận quà
            tặng khi liên hệ giao hàng.
          </div>
        )}

        <CheckoutStatusPoll orderId={order.orderId} initialStatus={order.status} />

        {qrUrl && (
          <p className="mt-6 text-center text-xs text-primary-light">
            Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận.
          </p>
        )}
      </div>
    </main>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-primary-light">{label}</span>
      <span className={`font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
