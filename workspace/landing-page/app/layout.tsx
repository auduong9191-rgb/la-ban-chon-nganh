import type { Metadata } from "next";
import Image from "next/image";
import { Cormorant, Montserrat, Dancing_Script } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "La Bàn Chọn Ngành Nghề | Tiara Edu",
  description:
    "Bộ 3 báo cáo cá nhân hóa cho học sinh 15-18 tuổi: phong cách học tập (VAKAD), Career Map và Chiến lược đỗ đại học mơ ước — giúp con tự tin chọn đúng hướng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${cormorant.variable} ${montserrat.variable} ${dancingScript.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <Image
          src="/tiara-edu-logo.png"
          alt=""
          width={480}
          height={480}
          aria-hidden
          className="pointer-events-none select-none fixed left-1/2 top-1/2 z-0 w-[70%] max-w-md -translate-x-1/2 -translate-y-1/2 opacity-[0.035]"
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
