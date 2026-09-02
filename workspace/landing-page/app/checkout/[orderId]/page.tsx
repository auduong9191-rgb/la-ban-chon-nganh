import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { generateVietQRUrl } from "@/lib/sepay";
import { LogoHeader } from "@/components/LogoHeader";
import { CheckoutPanel } from "@/components/CheckoutPanel";

export const dynamic = "force-dynamic";

type QuizJoin = { has_vakad: boolean } | { has_vakad: boolean }[] | null;

export default async function CheckoutPage(
  props: PageProps<"/checkout/[orderId]">
) {
  const { orderId } = await props.params;

  const { data: order } = await supabaseAdmin
    .from("leads")
    .select(
      "order_id, name, email, product_name, amount, status, quiz_leads(has_vakad)"
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const quizJoin = order.quiz_leads as QuizJoin;
  const quiz = Array.isArray(quizJoin) ? quizJoin[0] : quizJoin;
  const hasVakad = quiz ? quiz.has_vakad : null;

  const bankAccount = process.env.SEPAY_BANK_ACCOUNT_NUMBER!;
  const bankName = process.env.SEPAY_BANK_NAME!;
  const amount = order.amount ?? 0;
  const status = order.status as "pending" | "paid" | "expired";
  const qrUrl =
    status === "paid" || amount <= 0
      ? null
      : generateVietQRUrl({
          accountNumber: bankAccount,
          bank: bankName,
          amount,
          content: order.order_id,
          template: "compact",
        });

  return (
    <>
      <LogoHeader />
      <main className="min-h-screen bg-background py-12 px-4">
        <h1 className="font-heading text-2xl font-semibold text-ink text-center mb-1">
          {status === "paid" ? "Thanh toán thành công" : "Quét mã để thanh toán"}
        </h1>
        <p className="text-sm text-ink-soft text-center mb-8">
          Đơn hàng {order.order_id} — {order.product_name}
        </p>

        <CheckoutPanel
          orderId={order.order_id}
          email={order.email}
          bankName={bankName}
          bankAccount={bankAccount}
          initialAmount={amount}
          initialStatus={status}
          initialQrUrl={qrUrl}
          hasVakad={hasVakad}
        />
      </main>
    </>
  );
}
