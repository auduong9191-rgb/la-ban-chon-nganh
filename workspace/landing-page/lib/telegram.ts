// Gửi thông báo Telegram khi có thanh toán thành công.
// Luôn wrap trong try/catch ở nơi gọi — không được để lỗi Telegram làm fail webhook Sepay.

export async function sendTelegramNotification(text: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars");
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API error ${res.status}: ${body}`);
  }
}

export function formatPaymentNotification(opts: {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  productName: string;
  amount: number;
  gateway: string;
}): string {
  const amountFormatted = opts.amount.toLocaleString("vi-VN") + "đ";
  const timestamp = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return [
    `💰 Thanh toán mới — ${opts.orderId}`,
    ``,
    `Tên: ${opts.name}`,
    `SĐT: ${opts.phone}`,
    `Email: ${opts.email}`,
    `Sản phẩm: ${opts.productName}`,
    `Số tiền: ${amountFormatted}`,
    `Ngân hàng: ${opts.gateway}`,
    `Thời gian: ${timestamp}`,
  ].join("\n");
}
