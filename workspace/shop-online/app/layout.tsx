import type { Metadata } from "next";
import { Be_Vietnam_Pro, Nunito_Sans } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { QuickViewProvider } from "@/components/QuickViewProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingHotline } from "@/components/FloatingHotline";
import { BuyerInfoModal } from "@/components/BuyerInfoModal";
import { ProductQuickView } from "@/components/ProductQuickView";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "THẢO MỘC NHÀ THUỶ",
  description: "Thảo mộc lành – chăm sức khoẻ cả gia đình.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${nunitoSans.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <CartProvider>
          <QuickViewProvider>
            <Header />
            <div className="pt-16">{children}</div>
            <Footer />
            <FloatingHotline />
            <BuyerInfoModal />
            <ProductQuickView />
          </QuickViewProvider>
        </CartProvider>
      </body>
    </html>
  );
}
