import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LetterSection } from "@/components/LetterSection";
import { ReportsOverviewSection } from "@/components/ReportsOverviewSection";
import { ProblemSection } from "@/components/ProblemSection";
import { VakadStylesSection } from "@/components/VakadStylesSection";
import { SolutionSection } from "@/components/SolutionSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ReportPreviewSection } from "@/components/ReportPreviewSection";
import { ExpertSection } from "@/components/ExpertSection";
import { CertificatesSection } from "@/components/CertificatesSection";
import { OfferStackSection } from "@/components/OfferStackSection";
import { UrgencySection } from "@/components/UrgencySection";
import { FaqSection } from "@/components/FaqSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";
import { Footer } from "@/components/Footer";
import { StickyMobileCta } from "@/components/StickyMobileCta";
import { FloatingContactBar } from "@/components/FloatingContactBar";

export default function Home() {
  return (
    <>
      <Header />
      <main className="pb-24 md:pb-0">
        <Hero />
        <LetterSection />
        <ReportsOverviewSection />
        <ProblemSection />
        <VakadStylesSection />
        <SolutionSection />
        <BenefitsSection />
        <ReportPreviewSection />
        <ExpertSection />
        <CertificatesSection />
        <OfferStackSection />
        <UrgencySection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
      <StickyMobileCta />
      <FloatingContactBar />
    </>
  );
}
