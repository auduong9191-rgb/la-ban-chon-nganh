// Khung PDF cho "Báo cáo Xu hướng Học tập" (Gem 1, free_report) — báo cáo thứ
// 3 gửi kèm email khi khách đã trả phí VÀ đã làm bài test VAKAD (trước đây
// báo cáo này chỉ hiển thị trên trang /quiz/ket-qua, không có bản PDF).
// Dùng chung khung HTML/CSS với Chiến lược 360° ở lib/report-pdf-template.ts.

import {
  buildReportPdfHtml,
  buildReportPdfFooterTemplate,
  type ReportPdfInput,
} from "./report-pdf-template";

export type VakadReportPdfInput = Omit<
  ReportPdfInput,
  "coverTitleHtml" | "coverEyebrow" | "headerEyebrow" | "vakadDominantLabel"
> & {
  vakadDominantLabel: string; // báo cáo này chỉ tồn tại khi đã có VAKAD
};

export function buildVakadReportPdfHtml(input: VakadReportPdfInput): string {
  return buildReportPdfHtml({
    ...input,
    coverTitleHtml: "Báo cáo Xu hướng<br />Học tập &amp;<br />Phương pháp Tối ưu",
    coverEyebrow: "Xu hướng Học tập",
    headerEyebrow: "Xu hướng Học tập",
  });
}

export function buildVakadReportPdfFooterTemplate(): string {
  return buildReportPdfFooterTemplate();
}

// Marker [[UNLOCK_CTA]] chỉ có ý nghĩa trên trang web (thay bằng nút mua
// hàng thật) — khách đã thanh toán rồi nên bản PDF gửi kèm email phải bỏ
// hẳn dòng này, không để lộ placeholder thô ra file.
export function stripUnlockCtaMarker(markdown: string): string {
  return markdown
    .split("\n")
    .filter((line) => line.trim() !== "[[UNLOCK_CTA]]")
    .join("\n");
}
