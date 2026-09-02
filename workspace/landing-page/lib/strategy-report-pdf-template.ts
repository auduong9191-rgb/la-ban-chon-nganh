// Khung PDF cho "Chiến lược Chọn ngành, Chọn trường & Lộ trình xét tuyển 360°"
// (Gem 3) — giờ chỉ còn phần khác biệt (tiêu đề bìa/eyebrow), khung HTML/CSS
// dùng chung với các báo cáo PDF khác nằm ở lib/report-pdf-template.ts.

import {
  buildReportPdfHtml,
  buildReportPdfFooterTemplate,
  type ReportPdfInput,
} from "./report-pdf-template";

export type StrategyReportPdfInput = Omit<
  ReportPdfInput,
  "coverTitleHtml" | "coverEyebrow" | "headerEyebrow"
>;

export function buildStrategyReportPdfHtml(input: StrategyReportPdfInput): string {
  return buildReportPdfHtml({
    ...input,
    coverTitleHtml: "Chiến lược chọn ngành<br />chọn trường<br />Lộ trình xét tuyển 360&deg;",
    coverEyebrow: "Chiến lược Xét tuyển 360°",
    headerEyebrow: "Chiến lược Xét tuyển 360&deg;",
  });
}

export function buildStrategyReportPdfFooterTemplate(): string {
  return buildReportPdfFooterTemplate();
}
