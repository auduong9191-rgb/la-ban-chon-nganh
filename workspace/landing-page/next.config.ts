import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @sparticuz/chromium chứa binary nhị phân trong node_modules/@sparticuz/chromium/bin
  // — nếu để bundler (Turbopack/webpack) đóng gói lại, nó relocate code và làm
  // mất đường dẫn tới binary đó lúc chạy trên Vercel. Đánh dấu external để giữ
  // nguyên cấu trúc file gốc trong node_modules khi deploy.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // externalize thôi chưa đủ — Next.js's file tracer (@vercel/nft) không tự
  // phát hiện thư mục binary của @sparticuz/chromium vì nó không được require()
  // tĩnh mà chỉ tham chiếu qua path lúc chạy. Bắt buộc include thủ công để
  // Vercel đóng gói đúng binary vào output của function.
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/@sparticuz/chromium/**"],
  },
};

export default nextConfig;
