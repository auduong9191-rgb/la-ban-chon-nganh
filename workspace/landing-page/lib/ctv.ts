import "server-only";
import { supabaseAdmin } from "@/lib/supabase";
import { sendFreeReportToCtv, sendPaidLeadToCtv, sendFullReportsToCtv } from "@/lib/mailer";

export type Ctv = {
  ctv_code: string;
  name: string;
  email: string;
  group_type: string;
  commission_amount: number;
  is_active: boolean;
};

/**
 * Bỏ hết ký tự không phải a-z0-9 (dấu tiếng Việt, khoảng trắng, chữ dính
 * theo sau link do khách paste chung với tin nhắn kiểu "...tiara101đây") và
 * hạ thường — chuẩn hoá mã CTV thô lấy từ query param `?r=` trước khi so
 * khớp, vì link được CTV chia sẻ tay qua Zalo/Messenger rất dễ bị gõ nhầm
 * hoặc dính chữ thừa.
 */
function normalizeCode(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/**
 * Sửa mã CTV thô (từ `?r=`, có thể bị gõ nhầm hoặc dính chữ thừa khi CTV
 * paste link tay qua Zalo/Messenger — ví dụ "tiiaa101", "tiara101đây") về
 * đúng mã thật trong bảng `ctv`, để 1 CTV không bị tách thành nhiều dòng
 * khác nhau trong báo cáo hiệu suất/hoa hồng. Chỉ tự sửa khi mã sau chuẩn
 * hoá lệch tối đa 2 ký tự so với ĐÚNG MỘT mã đang active — lệch nhiều hơn
 * hoặc khớp mơ hồ với ≥2 mã thì giữ nguyên bản đã chuẩn hoá (không đoán
 * bừa) để còn dấu vết trong DB mà tra khi cần.
 */
export async function reconcileCtvCode(rawCode: string): Promise<string> {
  const cleaned = normalizeCode(rawCode);
  if (!cleaned) return cleaned;

  const { data } = await supabaseAdmin.from("ctv").select("ctv_code").eq("is_active", true);
  const knownCodes = (data ?? []).map((row) => row.ctv_code as string);
  if (knownCodes.includes(cleaned)) return cleaned;

  const MAX_DISTANCE = 2;
  let bestMatches: string[] = [];
  let bestDistance = MAX_DISTANCE + 1;
  for (const code of knownCodes) {
    const distance = levenshtein(cleaned, code);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatches = [code];
    } else if (distance === bestDistance) {
      bestMatches.push(code);
    }
  }

  if (bestDistance <= MAX_DISTANCE && bestMatches.length === 1) {
    return bestMatches[0];
  }
  return cleaned;
}

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
 * Sinh mã CTV ẩn danh dạng "tia{nhóm}{số thứ tự 2 chữ số}" — ví dụ tia101,
 * tia102 cho nhóm 1; tia201, tia202 cho nhóm 2. Không dùng tên thật để
 * tránh lộ danh tính CTV qua link tracking public (?ctv=...). Prefix ngắn
 * ("tia" thay vì "tiara") để giảm khả năng gõ nhầm khi CTV chia sẻ link tay
 * qua Zalo/Messenger. `attempt` dùng để né trùng mã khi insert xung đột (xem
 * vòng lặp gọi hàm này ở route POST).
 */
export async function generateCtvCode(groupType: string, attempt: number): Promise<string> {
  const group = groupType === "2" ? "2" : "1";
  const prefix = `tia${group}`;

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
 * Trigger 2 — ngay khi đơn thanh toán thành công, gửi đầy đủ thông tin khách
 * cho CTV giới thiệu (cả nhóm 1 lẫn nhóm 2) — nhóm nào cũng cần biết để tiếp
 * tục chăm sóc/upsell, không chỉ riêng nhóm 2 phải xuất Career Map. Nội dung
 * mail khác nhau theo group_type (xem sendPaidLeadToCtv). No-op nếu không có
 * ctv_code hoặc CTV không active.
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
  if (!ctv) return;

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
    groupType: ctv.group_type,
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

/**
 * Trigger 3 — ngay khi trọn bộ báo cáo (Career Map + Chiến lược + Xu hướng
 * Học tập nếu có) vừa gửi xong cho khách, gửi ĐÚNG bộ file đó cho CTV giới
 * thiệu (cả 2 nhóm) để họ chăm sóc/upsell tiếp — không cần đợi khách share
 * lại hay hỏi chủ shop. No-op nếu không có ctv_code hoặc CTV không active.
 */
export async function notifyCtvFullReports(params: {
  ctvCode: string | null | undefined;
  hoTen: string;
  tenPhuHuynh: string;
  phone: string;
  email: string;
  attachments: { fileName: string; pdfBuffer: Buffer }[];
  careerMapDownloadUrl?: string;
}): Promise<void> {
  const ctv = await findActiveCtv(params.ctvCode);
  if (!ctv) return;

  await sendFullReportsToCtv({
    to: ctv.email,
    ctvName: ctv.name,
    hoTen: params.hoTen,
    tenPhuHuynh: params.tenPhuHuynh,
    phone: params.phone,
    email: params.email,
    attachments: params.attachments,
    careerMapDownloadUrl: params.careerMapDownloadUrl,
  });
}
