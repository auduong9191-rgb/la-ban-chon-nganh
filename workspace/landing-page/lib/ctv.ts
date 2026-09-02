import "server-only";
import { supabaseAdmin } from "@/lib/supabase";
import { sendFreeReportToCtv, sendPaidLeadToCtv } from "@/lib/mailer";

export type Ctv = {
  ctv_code: string;
  name: string;
  email: string;
  group_type: string;
  commission_amount: number;
  is_active: boolean;
};

/**
 * Tra cứu CTV theo mã — trả về null nếu không tìm thấy/không active, không throw.
 * Đây luôn là tra cứu "best effort": mã CTV không có ràng buộc FK ở DB, nên lỗi ở
 * đây (gõ sai mã, CTV bị xoá...) không được phép làm hỏng luồng nộp bài test/
 * thanh toán chính của khách.
 */
export async function findActiveCtv(ctvCode: string | null | undefined): Promise<Ctv | null> {
  const code = ctvCode?.trim();
  if (!code) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from("ctv")
      .select("ctv_code, name, email, group_type, commission_amount, is_active")
      .eq("ctv_code", code)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return null;
    return data as Ctv;
  } catch {
    return null;
  }
}

/**
 * Sinh mã CTV ẩn danh dạng "tiara{nhóm}{số thứ tự 2 chữ số}" — ví dụ tiara101,
 * tiara102 cho nhóm 1; tiara201, tiara202 cho nhóm 2. Không dùng tên thật để
 * tránh lộ danh tính CTV qua link tracking public (?ctv=...). `attempt` dùng
 * để né trùng mã khi insert xung đột (xem vòng lặp gọi hàm này ở route POST).
 */
export async function generateCtvCode(groupType: string, attempt: number): Promise<string> {
  const group = groupType === "2" ? "2" : "1";
  const prefix = `tiara${group}`;

  const { data } = await supabaseAdmin
    .from("ctv")
    .select("ctv_code")
    .ilike("ctv_code", `${prefix}%`);

  let maxSeq = 0;
  for (const row of data ?? []) {
    const seq = parseInt((row.ctv_code as string).slice(prefix.length), 10);
    if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }

  const nextSeq = maxSeq + 1 + attempt;
  return `${prefix}${String(nextSeq).padStart(2, "0")}`;
}

/**
 * Trigger 1 — ngay khi khách hoàn tất GT (test VAKAD free), gửi kết quả cho CTV
 * đã giới thiệu (nếu có) để họ dùng tư vấn/upsell. Không throw khi không tìm
 * thấy CTV (no-op) — chỉ throw khi gửi mail thật sự lỗi, để nơi gọi (Promise.allSettled)
 * log lại mà không làm fail response trả cho khách.
 */
export async function notifyCtvFreeReport(params: {
  ctvCode: string | null | undefined;
  hoTen: string;
  khoiHoc: string;
  hocLuc: string;
  freeReport: string;
}): Promise<void> {
  const ctv = await findActiveCtv(params.ctvCode);
  if (!ctv) return;

  await sendFreeReportToCtv({
    to: ctv.email,
    ctvName: ctv.name,
    hoTen: params.hoTen,
    khoiHoc: params.khoiHoc,
    hocLuc: params.hocLuc,
    freeReport: params.freeReport,
  });
}

/**
 * Trigger 2 — ngay khi đơn thanh toán thành công, nếu CTV giới thiệu thuộc
 * nhóm '2' (có xuất Career Map), gửi đầy đủ thông tin khách để CTV chủ động
 * xuất Career Map + tư vấn — không cần đợi chủ shop kiểm tra rồi báo lại.
 * No-op nếu không có ctv_code, CTV không active, hoặc CTV thuộc nhóm 1.
 */
export async function notifyCtvPaidOrder(params: {
  ctvCode: string | null | undefined;
  quizLeadId: string | null | undefined;
  tenPhuHuynh: string;
  phone: string;
  email: string;
  productName: string;
  amount: number;
  paidAt: string;
}): Promise<void> {
  const ctv = await findActiveCtv(params.ctvCode);
  if (!ctv || ctv.group_type !== "2") return;

  let quizFields = {
    hoTen: "—",
    dob: "—",
    khoiHoc: "—",
    hocLuc: "—",
    freeReport: "(không có — đơn này chưa liên kết dữ liệu quiz)",
  };

  if (params.quizLeadId) {
    const { data: quizLead } = await supabaseAdmin
      .from("quiz_leads")
      .select("ho_ten, dob, khoi_hoc, hoc_luc, free_report")
      .eq("id", params.quizLeadId)
      .maybeSingle();
    if (quizLead) {
      quizFields = {
        hoTen: quizLead.ho_ten,
        dob: quizLead.dob,
        khoiHoc: quizLead.khoi_hoc,
        hocLuc: quizLead.hoc_luc,
        // Luồng phụ huynh bỏ qua VAKAD nên free_report có thể null — không có
        // báo cáo free nào để đính kèm, không phải lỗi.
        freeReport:
          quizLead.free_report ?? "(không có — khách đăng ký qua luồng phụ huynh, bỏ qua bài test VAKAD)",
      };
    }
  }

  const paidAtDisplay = new Date(params.paidAt).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await sendPaidLeadToCtv({
    to: ctv.email,
    ctvName: ctv.name,
    hoTen: quizFields.hoTen,
    dob: quizFields.dob,
    khoiHoc: quizFields.khoiHoc,
    hocLuc: quizFields.hocLuc,
    tenPhuHuynh: params.tenPhuHuynh,
    phone: params.phone,
    email: params.email,
    productName: params.productName,
    amount: params.amount,
    paidAt: paidAtDisplay,
    freeReport: quizFields.freeReport,
  });
}
