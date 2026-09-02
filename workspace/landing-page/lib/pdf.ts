import "server-only";
import type { Browser } from "puppeteer-core";

// Render 1 trang HTML thành PDF A4 bằng Chromium headless.
//
// Production (Vercel serverless): dùng puppeteer-core + @sparticuz/chromium
// (binary Linux nén riêng cho serverless — puppeteer đầy đủ quá nặng cho
// function bundle và không chạy được trên Lambda/Vercel runtime).
// Local dev (Windows/Mac): dùng gói `puppeteer` đầy đủ (devDependency) — nó
// tự tải Chromium đúng cho OS máy đang chạy, @sparticuz/chromium là binary
// Linux nên không chạy được khi `next dev` trên Windows.
async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
      import("@sparticuz/chromium"),
      import("puppeteer-core"),
    ]);
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    }) as unknown as Promise<Browser>;
  }

  const { default: puppeteerFull } = await import("puppeteer");
  return puppeteerFull.launch({ headless: true }) as unknown as Promise<Browser>;
}

export async function renderHtmlToPdf(
  html: string,
  opts?: { footerTemplate?: string }
): Promise<Buffer> {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: !!opts?.footerTemplate,
      headerTemplate: "<span></span>",
      footerTemplate: opts?.footerTemplate ?? "<span></span>",
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
