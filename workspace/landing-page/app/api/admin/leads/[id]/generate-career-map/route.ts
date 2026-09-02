// POST /api/admin/leads/[id]/generate-career-map
// Headers: x-admin-pass: <password>
// Body: { sourcePdfUrl: string }
//
// Pipeline tự động: tải PDF Career Map gốc (bên thứ 3, do Gein biên soạn sẵn)
// từ link -> Gemini đọc file gốc để trích insight ngành nghề nội bộ (KHÔNG
// viết lại thành báo cáo, file gốc gửi nguyên vẹn cho khách) -> insight đó
// làm ngữ cảnh cho Gemini viết báo cáo "Chiến lược 360°" -> đổ vào khung
// HTML/CSS chuẩn A4 -> render PDF (Puppeteer) -> lưu vào đúng chỗ đơn hàng
// (tái dùng bucket + cột career_map_*/strategy_* đã có) -> gửi email đính
// kèm CẢ 2 file (Career Map gốc + Chiến lược 360° PDF) cho khách qua Gmail SMTP.

import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkAdminPass } from "@/lib/admin-auth";
import { extractCareerMapInsights, generateStrategyReport } from "@/lib/gemini";
import { markdownToHtml } from "@/lib/markdown-to-html";
import {
  buildStrategyReportPdfHtml,
  buildStrategyReportPdfFooterTemplate,
} from "@/lib/strategy-report-pdf-template";
import {
  buildVakadReportPdfHtml,
  stripUnlockCtaMarker,
} from "@/lib/vakad-report-pdf-template";
import { renderHtmlToPdf } from "@/lib/pdf";
import { sendCareerMapEmail } from "@/lib/mailer";
import { VAKAD_GROUP_LABEL, type VakadGroup } from "@/lib/vakad-questions";

export const dynamic = "force-dynamic";
export const maxDuration = 280; // pipeline dài (tải file + 2x Gemini + 2x render PDF + 2x email) — 120s không đủ, đã timeout thật ngày 2026-08-30

const MAX_SOURCE_PDF_BYTES = 30 * 1024 * 1024; // 30MB — Career Map thật của chị Dương ~24MB, chừa dư phòng

// Gmail giới hạn tổng dung lượng email gửi đi khoảng 25MB (đã tính cả phần mã
// hoá base64 của file đính kèm, tăng thêm ~37% so với dung lượng gốc). Nếu file
// Career Map gốc vượt ngưỡng này, KHÔNG đính kèm trực tiếp (sẽ bị Gmail chặn/
// bounce) — gửi kèm link tải an toàn (signed URL) thay vào đó, vẫn đính kèm
// bình thường file Chiến lược 360° (luôn nhỏ vì do Puppeteer tự render).
const MAX_EMAIL_ATTACHMENT_BYTES = 15 * 1024 * 1024; // 15MB gốc ≈ ~20.5MB sau base64, chừa chỗ cho file Chiến lược + header

async function logoDataUri(fileName: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", fileName);
  const buffer = await readFile(filePath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]/generate-career-map">
) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const { sourcePdfUrl } = (body ?? {}) as { sourcePdfUrl?: string };
  if (!sourcePdfUrl || !/^https?:\/\//.test(sourcePdfUrl)) {
    return NextResponse.json(
      { error: "Link PDF Career Map không hợp lệ." },
      { status: 400 }
    );
  }

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select(
      `id, name, email,
       quiz_leads(ho_ten, dob, khoi_hoc, hoc_luc, vakad_dominant, duong_doi, ngay_sinh, su_menh, linh_hon, free_report, parent_email)`
    )
    .eq("id", id)
    .maybeSingle();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  const quiz = Array.isArray(lead.quiz_leads) ? lead.quiz_leads[0] : lead.quiz_leads;
  if (!quiz) {
    return NextResponse.json(
      {
        error:
          "Đơn này chưa liên kết dữ liệu quiz (đơn cũ) — dùng luồng thủ công (dán text/upload file) thay vì tự động.",
      },
      { status: 400 }
    );
  }
  if (!lead.email) {
    return NextResponse.json({ error: "Đơn hàng chưa có email khách." }, { status: 400 });
  }

  // 1. Tải PDF gốc từ link bên thứ 3
  let pdfBuffer: Buffer;
  try {
    const sourceRes = await fetch(sourcePdfUrl);
    if (!sourceRes.ok) {
      throw new Error(`Tải file lỗi (${sourceRes.status})`);
    }
    const contentLength = sourceRes.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_SOURCE_PDF_BYTES) {
      throw new Error("File PDF gốc quá lớn (giới hạn 30MB).");
    }
    const arrayBuffer = await sourceRes.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SOURCE_PDF_BYTES) {
      throw new Error("File PDF gốc quá lớn (giới hạn 30MB).");
    }
    pdfBuffer = Buffer.from(arrayBuffer);
    if (pdfBuffer.subarray(0, 4).toString("latin1") !== "%PDF") {
      throw new Error(
        "Link không trả về file PDF hợp lệ (có thể link yêu cầu đăng nhập hoặc chưa để public)."
      );
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: `Không tải được PDF gốc: ${err instanceof Error ? err.message : "lỗi không xác định"}`,
      },
      { status: 400 }
    );
  }

  const dobDisplay = (() => {
    const [y, m, d] = quiz.dob.split("-");
    return `${d}/${m}/${y}`;
  })();

  // null = đơn này đến từ luồng phụ huynh (bỏ qua bài test VAKAD, đi thẳng
  // thanh toán) — báo cáo Chiến lược phải tự chuyển sang CHẾ ĐỘ 2 (tinh gọn),
  // và không có báo cáo Xu hướng Học tập (Gem 1) nào để gửi kèm PDF thứ 3.
  const vakadDominantLabel = quiz.vakad_dominant
    ? VAKAD_GROUP_LABEL[quiz.vakad_dominant as VakadGroup]
    : null;
  const hasVakad = !!quiz.free_report;

  // 2a. Gemini đọc file PDF gốc, trích insight nội bộ (không phải báo cáo
  // gửi khách) — bước này phải chạy trước vì Chiến lược 360° cần dùng kết quả.
  let careerMapInsights: string;
  try {
    careerMapInsights = await extractCareerMapInsights({
      hoTen: quiz.ho_ten,
      pdfBase64: pdfBuffer.toString("base64"),
      pdfMimeType: "application/pdf",
    });
  } catch (err) {
    console.error("[generate-career-map] insight extraction error:", err);
    return NextResponse.json(
      { error: "Gemini đọc file Career Map gốc thất bại, vui lòng thử lại." },
      { status: 502 }
    );
  }

  // 2b. Viết báo cáo Chiến lược 360° (Gem 3), dùng insight ở trên làm ngữ cảnh
  let strategyMarkdown: string;
  try {
    strategyMarkdown = await generateStrategyReport({
      hoTen: quiz.ho_ten,
      dobDisplay,
      hocLuc: quiz.hoc_luc,
      vakadDominantLabel,
      duongDoi: quiz.duong_doi,
      suMenh: quiz.su_menh,
      linhHon: quiz.linh_hon,
      ngaySinh: quiz.ngay_sinh,
      careerMapInsights,
    });
  } catch (err) {
    console.error("[generate-career-map] gemini error:", err);
    return NextResponse.json(
      { error: "Gemini phân tích thất bại, vui lòng thử lại." },
      { status: 502 }
    );
  }

  // 3. Đổ báo cáo Chiến lược vào khung HTML A4 + render PDF — Career Map gốc
  // KHÔNG qua bước này, gửi nguyên vẹn file bên thứ 3 đã tải ở bước 1.
  let strategyPdfBuffer: Buffer;
  try {
    const [tiaraLogoDataUri, geinLogoDataUri] = await Promise.all([
      logoDataUri("tiara-edu-logo.png"),
      logoDataUri("gein-logo.png"),
    ]);
    const strategyHtml = buildStrategyReportPdfHtml({
      hoTen: quiz.ho_ten,
      dobDisplay,
      hocLuc: quiz.hoc_luc,
      vakadDominantLabel,
      duongDoi: quiz.duong_doi,
      suMenh: quiz.su_menh,
      linhHon: quiz.linh_hon,
      ngaySinh: quiz.ngay_sinh,
      analysisHtml: markdownToHtml(strategyMarkdown),
      tiaraLogoDataUri,
      geinLogoDataUri,
    });
    strategyPdfBuffer = await renderHtmlToPdf(strategyHtml, {
      footerTemplate: buildStrategyReportPdfFooterTemplate(),
    });
  } catch (err) {
    console.error("[generate-career-map] pdf render error:", err);
    return NextResponse.json(
      { error: "Tạo file PDF thất bại, vui lòng thử lại." },
      { status: 500 }
    );
  }

  // 3b. Nếu học sinh đã làm bài test VAKAD, render thêm bản PDF cho báo cáo
  // Xu hướng Học tập (Gem 1, free_report) — trước đây báo cáo này chỉ hiện
  // trên web, giờ gửi kèm email luôn thành báo cáo thứ 3 trong bộ.
  let vakadReportPdfBuffer: Buffer | null = null;
  if (hasVakad && vakadDominantLabel) {
    try {
      const [tiaraLogoDataUri, geinLogoDataUri] = await Promise.all([
        logoDataUri("tiara-edu-logo.png"),
        logoDataUri("gein-logo.png"),
      ]);
      const vakadHtml = buildVakadReportPdfHtml({
        hoTen: quiz.ho_ten,
        dobDisplay,
        hocLuc: quiz.hoc_luc,
        vakadDominantLabel,
        duongDoi: quiz.duong_doi,
        suMenh: quiz.su_menh,
        linhHon: quiz.linh_hon,
        ngaySinh: quiz.ngay_sinh,
        analysisHtml: markdownToHtml(stripUnlockCtaMarker(quiz.free_report!)),
        tiaraLogoDataUri,
        geinLogoDataUri,
      });
      vakadReportPdfBuffer = await renderHtmlToPdf(vakadHtml, {
        footerTemplate: buildStrategyReportPdfFooterTemplate(),
      });
    } catch (err) {
      // Không chặn cả pipeline nếu riêng bước này lỗi — vẫn gửi 2 báo cáo còn
      // lại, chỉ log lại để xử lý tay.
      console.error("[generate-career-map] vakad report pdf render error:", err);
      vakadReportPdfBuffer = null;
    }
  }

  // 4. Lưu vào đúng chỗ đơn hàng (tái dùng bucket + cột đã có cho luồng thủ công)
  const careerMapFileName = `Career-Map-${quiz.ho_ten}.pdf`;
  const strategyFileName = `Chien-Luoc-Xet-Tuyen-${quiz.ho_ten}.pdf`;
  const vakadReportFileName = `Xu-Huong-Hoc-Tap-${quiz.ho_ten}.pdf`;
  const careerMapStoragePath = `${id}/career-map.pdf`;
  const strategyStoragePath = `${id}/chien-luoc-xet-tuyen.pdf`;
  const vakadReportStoragePath = `${id}/xu-huong-hoc-tap.pdf`;

  const [careerMapUpload, strategyUpload, vakadReportUpload] = await Promise.all([
    supabaseAdmin.storage
      .from("career-maps")
      .upload(careerMapStoragePath, pdfBuffer, { contentType: "application/pdf", upsert: true }),
    supabaseAdmin.storage
      .from("career-maps")
      .upload(strategyStoragePath, strategyPdfBuffer, { contentType: "application/pdf", upsert: true }),
    vakadReportPdfBuffer
      ? supabaseAdmin.storage
          .from("career-maps")
          .upload(vakadReportStoragePath, vakadReportPdfBuffer, {
            contentType: "application/pdf",
            upsert: true,
          })
      : Promise.resolve({ error: null }),
  ]);

  if (careerMapUpload.error || strategyUpload.error || vakadReportUpload.error) {
    console.error(
      "[generate-career-map] upload error:",
      careerMapUpload.error?.message,
      strategyUpload.error?.message,
      vakadReportUpload.error?.message
    );
    return NextResponse.json({ error: "Lưu file thất bại." }, { status: 500 });
  }

  const nowIso = new Date().toISOString();
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("leads")
    .update({
      career_map_text: careerMapInsights,
      career_map_file_path: careerMapStoragePath,
      career_map_file_name: careerMapFileName,
      career_map_updated_at: nowIso,
      strategy_text: strategyMarkdown,
      strategy_file_path: strategyStoragePath,
      strategy_file_name: strategyFileName,
      strategy_updated_at: nowIso,
      ...(vakadReportPdfBuffer
        ? {
            vakad_report_file_path: vakadReportStoragePath,
            vakad_report_file_name: vakadReportFileName,
            vakad_report_updated_at: nowIso,
          }
        : {}),
    })
    .eq("id", id)
    .select(
      "career_map_text, career_map_file_path, career_map_file_name, career_map_updated_at, strategy_text, strategy_file_path, strategy_file_name, strategy_updated_at, vakad_report_file_path, vakad_report_file_name, vakad_report_updated_at"
    )
    .maybeSingle();

  if (updateError || !updated) {
    console.error("[generate-career-map] db update error:", updateError?.message);
    return NextResponse.json({ error: "Lưu dữ liệu thất bại." }, { status: 500 });
  }

  const [careerMapSigned, strategySigned, vakadReportSigned] = await Promise.all([
    supabaseAdmin.storage.from("career-maps").createSignedUrl(careerMapStoragePath, 60 * 60 * 24),
    supabaseAdmin.storage.from("career-maps").createSignedUrl(strategyStoragePath, 60 * 60 * 24),
    vakadReportPdfBuffer
      ? supabaseAdmin.storage.from("career-maps").createSignedUrl(vakadReportStoragePath, 60 * 60 * 24)
      : Promise.resolve({ data: null }),
  ]);

  // 5. Gửi email đính kèm đủ báo cáo cho khách (Career Map gốc nguyên vẹn +
  // Chiến lược 360° PDF + Xu hướng Học tập PDF nếu có) — lỗi bước này KHÔNG
  // làm hỏng kết quả đã lưu ở trên, chị vẫn có thể tải file/gửi tay nếu email
  // thất bại. Nếu Career Map gốc quá nặng để đính kèm an toàn qua Gmail, gửi
  // link tải (signed URL) thay vì đính kèm trực tiếp, tránh Gmail chặn/bounce
  // cả email.
  const careerMapTooLargeForEmail = pdfBuffer.byteLength > MAX_EMAIL_ATTACHMENT_BYTES;
  const emailAttachments = [
    ...(careerMapTooLargeForEmail ? [] : [{ fileName: careerMapFileName, pdfBuffer }]),
    { fileName: strategyFileName, pdfBuffer: strategyPdfBuffer },
    ...(vakadReportPdfBuffer
      ? [{ fileName: vakadReportFileName, pdfBuffer: vakadReportPdfBuffer }]
      : []),
  ];
  const careerMapDownloadUrl = careerMapTooLargeForEmail
    ? careerMapSigned.data?.signedUrl ?? undefined
    : undefined;

  // Luồng học sinh có để lại email phụ huynh (không bắt buộc) — gửi thêm 1
  // bản riêng, đúng văn phong "ba mẹ", cùng đính kèm như bản gửi con. Gửi
  // song song với bản chính (2 lệnh gọi SMTP độc lập) để đỡ tốn thời gian —
  // lỗi ở bản này không ảnh hưởng tới bản đã gửi cho con.
  const [mainEmailResult, parentEmailResult] = await Promise.allSettled([
    sendCareerMapEmail({
      to: lead.email,
      hoTen: quiz.ho_ten,
      audience: hasVakad ? "student" : "parent",
      hasVakad,
      attachments: emailAttachments,
      careerMapDownloadUrl,
    }),
    quiz.parent_email
      ? sendCareerMapEmail({
          to: quiz.parent_email,
          hoTen: quiz.ho_ten,
          audience: "parent",
          hasVakad,
          attachments: emailAttachments,
          careerMapDownloadUrl,
        })
      : Promise.resolve(null),
  ]);

  let emailSent = false;
  let emailError: string | null = null;
  if (mainEmailResult.status === "fulfilled") {
    emailSent = true;
  } else {
    console.error("[generate-career-map] email error:", mainEmailResult.reason);
    emailError =
      mainEmailResult.reason instanceof Error
        ? mainEmailResult.reason.message
        : "Gửi email thất bại.";
  }

  let parentEmailSent: boolean | null = null;
  let parentEmailError: string | null = null;
  if (quiz.parent_email) {
    if (parentEmailResult.status === "fulfilled") {
      parentEmailSent = true;
    } else {
      console.error("[generate-career-map] parent email error:", parentEmailResult.reason);
      parentEmailSent = false;
      parentEmailError =
        parentEmailResult.reason instanceof Error
          ? parentEmailResult.reason.message
          : "Gửi email thất bại.";
    }
  }

  return NextResponse.json({
    ...updated,
    career_map_file_url: careerMapSigned.data?.signedUrl ?? null,
    strategy_file_url: strategySigned.data?.signedUrl ?? null,
    vakad_report_file_url: vakadReportSigned.data?.signedUrl ?? null,
    emailSent,
    emailError,
    parentEmailSent,
    parentEmailError,
  });
}
