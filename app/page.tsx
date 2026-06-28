import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { ProblemStatement } from "@/components/landing/ProblemStatement";
import { ProductWorkspace } from "@/components/landing/ProductWorkspace";
import { MissionSection } from "@/components/landing/MissionSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { UseCases } from "@/components/landing/UseCases";
import { TrustPillars } from "@/components/landing/TrustPillars";
import { SecurityBadges } from "@/components/landing/SecurityBadges";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <StatsBar />
        <ProblemStatement />
        <ProductWorkspace />
        <MissionSection />
        <HowItWorks />
        <ComparisonSection />
        <UseCases />
        <TrustPillars />
        <SecurityBadges />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
