// Khung HTML/CSS chuẩn A4 dùng chung cho MỌI báo cáo PDF cá nhân hóa (Chiến
// lược 360° - Gem 3, và Xu hướng Học tập - Gem 1) — tách ra từ
// strategy-report-pdf-template.ts để dùng lại đúng 1 bộ style/khung trang bìa
// thay vì copy 300 dòng HTML/CSS. `coverTitleHtml` (có thể chứa <br/>) và
// `coverEyebrow`/`headerEyebrow` là phần khác nhau giữa các loại báo cáo.

export type ReportPdfInput = {
  coverTitleHtml: string;
  coverEyebrow: string;
  headerEyebrow: string;
  hoTen: string;
  dobDisplay: string;
  hocLuc: string;
  // null = học sinh chưa làm bài test VAKAD — ẩn hẳn dòng VAKAD trong hồ sơ.
  vakadDominantLabel: string | null;
  duongDoi: number;
  suMenh: number | null;
  linhHon: number | null;
  ngaySinh: number;
  analysisHtml: string; // output của markdownToHtml(geminiText)
  tiaraLogoDataUri: string;
  geinLogoDataUri: string;
};

function indexChip(label: string, value: number | null): string {
  return `<div class="index-chip">
    <span class="num${value === null ? " num-empty" : ""}">${value ?? "—"}</span>
    <span class="lbl">${label}</span>
  </div>`;
}

export function buildReportPdfHtml(input: ReportPdfInput): string {
  const vakadRow = input.vakadDominantLabel
    ? `<div style="grid-column: 1 / -1;"><span class="label">Nhóm VAKAD ưu thế: </span><span class="value">${input.vakadDominantLabel}</span></div>`
    : "";

  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 22mm 18mm 20mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Montserrat", Arial, sans-serif;
    font-size: 12.5px;
    line-height: 1.6;
    color: #2b1c12;
    background: #fbf7ef;
  }

  /* Watermark cố định — lặp lại trên MỌI trang khi in (Chromium repeat
     position:fixed cho từng trang PDF). Đặt ngoài .page-content để không
     bị bó theo z-index/khối nào cụ thể. */
  .page-watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 62%;
    transform: translate(-50%, -50%);
    opacity: 0.05;
    z-index: 0;
    pointer-events: none;
  }
  .page-watermark img { width: 100%; display: block; }

  /* Bọc toàn bộ nội dung hiển thị trong 1 stacking context có z-index dương
     để luôn nổi trên watermark (fixed, z-index:auto) ở mọi trang. */
  .page-content { position: relative; z-index: 1; }

  .cover-page { height: 253mm; page-break-after: always; }
  .cover-frame {
    height: 100%;
    border: 1.25px solid #cbb98a;
    display: flex;
    flex-direction: column;
    padding: 12mm 10mm 0;
    overflow: hidden;
  }
  .cover-brand {
    text-align: center;
    font-size: 13px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #96702e;
    font-weight: 600;
  }
  .cover-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 4mm;
  }
  .cover-title {
    font-family: "Cormorant", serif;
    font-weight: 700;
    font-size: 50px;
    letter-spacing: 0.5px;
    line-height: 1.16;
    color: #2b1c12;
    margin: 0;
    max-width: 100%;
  }
  .cover-rule { width: 72px; height: 2px; background: #96702e; margin: 28px 0 24px; }
  .cover-for {
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #6b5a4a;
    margin: 0 0 8px;
  }
  .cover-student-name {
    font-family: "Cormorant", serif;
    font-weight: 700;
    font-size: 34px;
    color: #4a2c17;
    margin: 0;
  }
  .cover-logos {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    width: 70%;
    margin: 0 auto;
    padding: 16px 0 14mm;
    border-top: 1px solid #e3d5b8;
  }
  .cover-logos img { height: 30px; object-fit: contain; }
  .cover-logos .divider { width: 1px; height: 20px; background: #cbb98a; }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #cbb98a;
    padding-bottom: 12px;
    margin-bottom: 22px;
  }
  .header img { height: 26px; object-fit: contain; }
  .header .logos { display: flex; align-items: center; gap: 14px; }
  .header .eyebrow {
    font-size: 10.5px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #96702e;
    font-weight: 600;
  }

  .profile-card {
    background: #f5efe3;
    border: 1px solid #e3d5b8;
    border-radius: 14px;
    padding: 18px 22px 20px;
    margin-bottom: 26px;
  }
  .profile-card .profile-title {
    font-family: "Cormorant", serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #6f5220;
    margin: 0 0 14px;
  }
  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px 24px;
    font-size: 12px;
    margin-bottom: 16px;
  }
  .profile-grid .label { color: #6b5a4a; }
  .profile-grid .value { font-weight: 600; }
  .index-row { display: flex; gap: 10px; padding-top: 16px; border-top: 1px solid #e3d5b8; }
  .index-chip { flex: 1; text-align: center; }
  .index-chip .num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #96702e;
    color: #fff;
    font-family: "Cormorant", serif;
    font-weight: 700;
    font-size: 16px;
  }
  .index-chip .num-empty { background: #cbb98a; }
  .index-chip .lbl {
    display: block;
    font-size: 9px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #6b5a4a;
    margin-top: 5px;
  }

  .content h1 {
    font-family: "Cormorant", serif;
    font-size: 21px;
    font-weight: 700;
    margin: 0 0 6px;
    color: #2b1c12;
  }
  .content h2 {
    display: inline-block;
    font-family: "Cormorant", serif;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #4a2c17;
    background: linear-gradient(90deg, #f1e3bf 0%, #e9d7a8 65%, rgba(233, 215, 168, 0) 100%);
    padding: 6px 20px 6px 14px;
    border-radius: 2px 16px 16px 2px;
    margin: 22px 0 12px;
    page-break-after: avoid;
  }
  .content h3 {
    font-family: "Cormorant", serif;
    font-size: 14px;
    font-weight: 700;
    color: #6b4226;
    margin: 16px 0 8px;
    page-break-after: avoid;
  }
  .content h4 {
    font-family: "Cormorant", serif;
    font-size: 13px;
    font-weight: 700;
    font-style: italic;
    color: #6b4226;
    margin: 14px 0 6px;
    page-break-after: avoid;
  }
  .content p { margin: 0 0 10px; }
  .content ul, .content ol { margin: 0 0 12px; padding-left: 20px; }
  .content li { margin-bottom: 6px; }
  .content li > ul { margin-top: 6px; margin-bottom: 0; }
  .content strong { color: #4a2c17; }
  .content blockquote {
    border-left: 3px solid #96702e;
    margin: 14px 0;
    padding: 4px 16px;
    color: #6b5a4a;
  }
  .content hr { border: none; border-top: 1px solid #e3d5b8; margin: 18px 0; }

  .content table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px;
    font-size: 10.5px;
    page-break-inside: auto;
  }
  .content table tr { page-break-inside: avoid; page-break-after: auto; }
  .content th {
    background: #f1e3bf;
    color: #4a2c17;
    font-family: "Cormorant", serif;
    font-weight: 700;
    text-align: left;
    padding: 7px 8px;
    border: 1px solid #e3d5b8;
  }
  .content td {
    padding: 7px 8px;
    border: 1px solid #e3d5b8;
    vertical-align: top;
  }
  .content tbody tr:nth-child(even) { background: #f5efe3; }

  .footer-note {
    margin-top: 26px;
    padding-top: 12px;
    border-top: 1px solid #e3d5b8;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 10px;
    color: #6b5a4a;
    text-align: center;
  }
  .footer-note img { height: 14px; object-fit: contain; opacity: 0.8; }
</style>
</head>
<body>
  <div class="page-watermark"><img src="${input.tiaraLogoDataUri}" alt="" /></div>

  <div class="page-content">
    <div class="cover-page">
      <div class="cover-frame">
        <div class="cover-brand">Tiara Edu &times; Gein Academy</div>
        <div class="cover-main">
          <h1 class="cover-title">${input.coverTitleHtml}</h1>
          <div class="cover-rule"></div>
          <p class="cover-for">cho học sinh</p>
          <p class="cover-student-name">${input.hoTen}</p>
        </div>
        <div class="cover-logos">
          <img src="${input.tiaraLogoDataUri}" alt="Tiara Edu" />
          <span class="divider"></span>
          <img src="${input.geinLogoDataUri}" alt="Gein Academy" />
        </div>
      </div>
    </div>

    <div class="header">
      <div class="logos">
        <img src="${input.tiaraLogoDataUri}" alt="Tiara Edu" />
        <img src="${input.geinLogoDataUri}" alt="Gein Academy" />
      </div>
      <div class="eyebrow">${input.headerEyebrow}</div>
    </div>

    <div class="profile-card">
      <p class="profile-title">Hồ sơ học sinh</p>
      <div class="profile-grid">
        <div><span class="label">Họ và tên: </span><span class="value">${input.hoTen}</span></div>
        <div><span class="label">Ngày sinh: </span><span class="value">${input.dobDisplay}</span></div>
        <div style="grid-column: 1 / -1;"><span class="label">Học lực hiện tại: </span><span class="value">${input.hocLuc}</span></div>
        ${vakadRow}
      </div>
      <div class="index-row">
        ${indexChip("Đường Đời", input.duongDoi)}
        ${indexChip("Sứ Mệnh", input.suMenh)}
        ${indexChip("Linh Hồn", input.linhHon)}
        ${indexChip("Ngày Sinh", input.ngaySinh)}
      </div>
    </div>

    <div class="content">
      ${input.analysisHtml}
    </div>

    <div class="footer-note">
      <img src="${input.tiaraLogoDataUri}" alt="" />
      <span>Tiara Edu &times; Gein Academy — Báo cáo cá nhân hóa, vui lòng không chia sẻ ra ngoài.</span>
    </div>
  </div>
</body>
</html>`;
}

export function buildReportPdfFooterTemplate(): string {
  return `<div style="width:100%;font-family:Arial,sans-serif;font-size:8px;color:#6b5a4a;text-align:center;padding:0 18mm;">Trang <span class="pageNumber"></span>/<span class="totalPages"></span></div>`;
}
