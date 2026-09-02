import "server-only";
import nodemailer from "nodemailer";

// Gửi email qua Gmail SMTP dùng App Password (không phải mật khẩu Gmail
// thường — tạo tại myaccount.google.com/apppasswords, cần bật 2FA trước).
function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD env var");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

// Kênh Zalo chính thức của Tiara Edu — cùng số dùng cho hotline
// (components/FloatingContactBar.tsx), định dạng quốc tế 84 không có số 0 đầu.
const ZALO_URL = "https://zalo.me/84948645419";

export async function sendCareerMapEmail(params: {
  to: string;
  hoTen: string;
  attachments: { fileName: string; pdfBuffer: Buffer }[];
  // Ai là người ĐỌC email này — quyết định xưng hô/giọng văn. Độc lập với
  // hasVakad: 1 đơn có VAKAD vẫn có thể gửi 1 bản cho con (audience "student")
  // VÀ 1 bản riêng cho ba mẹ (audience "parent") nếu ba mẹ có để lại email.
  audience: "student" | "parent";
  // true khi học sinh đã làm bài test VAKAD — báo cáo Xu hướng Học tập PDF
  // được đính kèm thêm (3 báo cáo thay vì 2 — áp dụng cho MỌI bản gửi của
  // đơn này, không phụ thuộc audience), và ẩn gợi ý "làm thêm bài test VAKAD".
  hasVakad?: boolean;
  // Đặt khi Career Map gốc quá nặng để đính kèm an toàn qua Gmail — gửi link
  // tải (signed URL, 24h) thay vì đính kèm trực tiếp để tránh Gmail bounce.
  careerMapDownloadUrl?: string;
}): Promise<void> {
  const transport = getTransport();
  const forStudent = params.audience === "student";
  const hasVakad = !!params.hasVakad;

  const bundleLabel = hasVakad
    ? "trọn bộ 3 báo cáo (Xu hướng Học tập + Career Map + Chiến lược đỗ đại học mơ ước)"
    : "trọn bộ Career Map + Chiến lược đỗ đại học mơ ước";

  const downloadLineText = params.careerMapDownloadUrl
    ? `\n\nFile Career Map gốc có dung lượng lớn nên Tiara Edu gửi kèm link tải riêng (hiệu lực 24h): ${params.careerMapDownloadUrl}`
    : "";
  const downloadLineHtml = params.careerMapDownloadUrl
    ? `<p>File Career Map gốc có dung lượng lớn nên Tiara Edu gửi kèm <a href="${params.careerMapDownloadUrl}">link tải riêng</a> (hiệu lực 24h).</p>`
    : "";

  const siteUrl = process.env.SITE_URL;
  // Chưa có VAKAD — gợi ý làm thêm bài test để lần định hướng sau chính xác
  // hơn (cùng thông điệp với trang /checkout). Không phụ thuộc audience: nếu
  // đơn chưa có VAKAD thì cả bản gửi con lẫn bản gửi ba mẹ đều cần gợi ý này.
  const vakadUpsellText = !hasVakad
    ? `\n\nBáo cáo định hướng của con sẽ càng chính xác hơn nếu con làm thêm bài test Xu hướng Học tập (VAKAD, miễn phí, chỉ 4-5 phút)${
        siteUrl ? ` tại ${siteUrl}/quiz` : " ở mục bài test miễn phí trên trang chủ Tiara Edu"
      }.`
    : "";
  const vakadUpsellHtml = !hasVakad
    ? `<p>Báo cáo định hướng của con sẽ càng chính xác hơn nếu con làm thêm bài test Xu hướng Học tập (VAKAD, miễn phí, chỉ 4-5 phút)${
        siteUrl
          ? ` tại <a href="${siteUrl}/quiz">${siteUrl}/quiz</a>`
          : " ở mục bài test miễn phí trên trang chủ Tiara Edu"
      }.</p>`
    : "";

  // Copy do chị Dương cung cấp — lý do NÊN đặt buổi Coach 1-1 (báo cáo dựa
  // trên dữ liệu cố định, còn tâm lý/hoàn cảnh/diễn biến ôn luyện thì biến
  // động, cần chuyên gia rà soát trực tiếp mới "may đo" đúng thực tế).
  const coachCtaReasonText = `Báo cáo cung cấp các phương án dữ liệu tối ưu dựa trên các thông tin cố định. Tuy nhiên, mỗi bạn trẻ đều có những biến số về tâm lý, môi trường gia đình và sự thay đổi trong quá trình ôn luyện. Để chốt được danh sách nguyện vọng cuối cùng và một lộ trình hành động "may đo" sát thực tế nhất, con và gia đình nên có một buổi ngồi lại cùng chuyên gia để rà soát toàn diện.`;
  const coachCtaContactText = forStudent
    ? `Tiara Edu có cung cấp dịch vụ Coach 1-1 để đồng hành cùng con và gia đình. Con nhắn Zalo Tiara Edu để liên hệ đặt lịch nhé: ${ZALO_URL}`
    : `Tiara Edu có cung cấp dịch vụ Coach 1-1 để đồng hành cùng con và gia đình. Ba mẹ nhắn Zalo Tiara Edu để liên hệ đặt lịch nhé: ${ZALO_URL}`;
  const coachCtaText = `${coachCtaReasonText}\n\n${coachCtaContactText}`;
  const coachCtaHtml = `<p>${coachCtaReasonText}</p>
<p>${forStudent ? "Tiara Edu có cung cấp dịch vụ <strong>Coach 1-1</strong> để đồng hành cùng con và gia đình. Con nhắn Zalo Tiara Edu để liên hệ đặt lịch nhé" : "Tiara Edu có cung cấp dịch vụ <strong>Coach 1-1</strong> để đồng hành cùng con và gia đình. Ba mẹ nhắn Zalo Tiara Edu để liên hệ đặt lịch nhé"}: <a href="${ZALO_URL}">${ZALO_URL}</a></p>`;

  const subject = hasVakad
    ? `Trọn bộ 3 báo cáo của con đã sẵn sàng — Tiara Edu`
    : `Career Map & Chiến lược đỗ đại học mơ ước của con đã sẵn sàng — Tiara Edu`;

  const greetingText = forStudent ? `Chào con ${params.hoTen},` : `Kính gửi ba mẹ,`;
  const greetingHtml = forStudent
    ? `Chào con <strong>${params.hoTen}</strong>,`
    : `Kính gửi ba mẹ,`;

  const introText = forStudent
    ? `Thầy/Cô Tiara Edu gửi con ${bundleLabel} trong file đính kèm. Con dành thời gian đọc kỹ từng báo cáo nhé — đặc biệt là Phần III của bản Chiến lược để nắm rõ 5 ngành và 3 phương án trường phù hợp nhất với con.`
    : `Tiara Edu gửi ba mẹ ${bundleLabel} dành riêng cho con ${params.hoTen} — đính kèm trong email này. Ba mẹ dành thời gian xem cùng con nhé, đặc biệt là Phần III của bản Chiến lược để nắm rõ 5 ngành và 3 phương án trường phù hợp nhất với năng lực hiện tại của con.`;

  const closingText = forStudent
    ? `Nếu con có bất kỳ câu hỏi nào về nội dung báo cáo, con cứ nhắn lại để Thầy/Cô hỗ trợ thêm.`
    : `Nếu ba mẹ có bất kỳ câu hỏi nào về nội dung báo cáo, ba mẹ cứ nhắn lại để Tiara Edu hỗ trợ thêm.`;

  await transport.sendMail({
    from: `"Tiara Edu" <${process.env.GMAIL_USER}>`,
    to: params.to,
    subject,
    text: `${greetingText}\n\n${introText}${downloadLineText}${vakadUpsellText}\n\n${coachCtaText}\n\n${closingText}\n\nTrân trọng,\nTiara Edu`,
    html: `<p>${greetingHtml}</p>
<p>${introText}</p>
${downloadLineHtml}
${vakadUpsellHtml}
${coachCtaHtml}
<p>${closingText}</p>
<p>Trân trọng,<br/>Tiara Edu</p>`,
    attachments: params.attachments.map((a) => ({
      filename: a.fileName,
      content: a.pdfBuffer,
      contentType: "application/pdf",
    })),
  });
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return s.replace(/[&<>"']/g, (c) => map[c]);
}

// Trigger 1 — gửi ngay khi khách hoàn tất GT (test VAKAD free), để CTV giới
// thiệu dùng kết quả tư vấn/upsell gói trọn bộ. Đây là bản sao duy nhất "thoát
// ra" khỏi hệ thống cho lead free — khách chỉ đọc được trên web, thoát ra là mất.
export async function sendFreeReportToCtv(params: {
  to: string;
  ctvName: string;
  hoTen: string;
  khoiHoc: string;
  hocLuc: string;
  freeReport: string;
}): Promise<void> {
  const transport = getTransport();
  const fromUser = process.env.GMAIL_USER;

  await transport.sendMail({
    from: `"Tiara Edu" <${fromUser}>`,
    to: params.to,
    subject: `[Tiara Edu] Kết quả test free của ${params.hoTen}`,
    text: `Chào ${params.ctvName},\n\nBạn ${params.hoTen} (${params.khoiHoc}, học lực ${params.hocLuc}) vừa hoàn thành bài test VAKAD miễn phí. Kết quả:\n\n${params.freeReport}\n\nDùng kết quả này để tư vấn và giới thiệu thêm gói Career Map trọn bộ nhé.\n\nTrân trọng,\nTiara Edu`,
    html: `<p>Chào ${params.ctvName},</p>
<p>Bạn <strong>${params.hoTen}</strong> (${params.khoiHoc}, học lực ${params.hocLuc}) vừa hoàn thành bài test VAKAD miễn phí. Kết quả:</p>
<div style="white-space:pre-wrap;border-left:3px solid #ddd;padding-left:12px;margin:12px 0;">${escapeHtml(params.freeReport)}</div>
<p>Dùng kết quả này để tư vấn và giới thiệu thêm gói Career Map trọn bộ nhé.</p>
<p>Trân trọng,<br/>Tiara Edu</p>`,
  });
}

// Trigger 2 — gửi ngay khi đơn thanh toán thành công, chỉ cho CTV nhóm '2' (có
// xuất Career Map), để họ chủ động xuất map + tư vấn mà không cần chủ shop
// kiểm tra Telegram rồi báo lại thủ công.
export async function sendPaidLeadToCtv(params: {
  to: string;
  ctvName: string;
  hoTen: string;
  dob: string;
  khoiHoc: string;
  hocLuc: string;
  tenPhuHuynh: string;
  phone: string;
  email: string;
  productName: string;
  amount: number;
  paidAt: string;
  freeReport: string;
}): Promise<void> {
  const transport = getTransport();
  const fromUser = process.env.GMAIL_USER;
  const amountFormatted = params.amount.toLocaleString("vi-VN") + "đ";

  const bodyText = `Chào ${params.ctvName},

Khách bạn giới thiệu vừa thanh toán thành công — bạn xuất Career Map cho bạn này nhé:

--- Để xuất Career Map ---
Họ tên học sinh: ${params.hoTen}
Ngày sinh: ${params.dob}
Khối học: ${params.khoiHoc}
Học lực: ${params.hocLuc}

--- Để tư vấn khách ---
Tên phụ huynh: ${params.tenPhuHuynh}
SĐT: ${params.phone}
Email: ${params.email}
Sản phẩm: ${params.productName}
Số tiền: ${amountFormatted}
Thời điểm thanh toán: ${params.paidAt}

--- Báo cáo free (tham khảo) ---
${params.freeReport}

Trân trọng,
Tiara Edu`;

  await transport.sendMail({
    from: `"Tiara Edu" <${fromUser}>`,
    to: params.to,
    subject: `[Tiara Edu] Khách mới đã thanh toán — cần xuất Career Map cho ${params.hoTen}`,
    text: bodyText,
    html: `<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(bodyText)}</pre>`,
  });
}
