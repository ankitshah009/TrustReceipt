import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { ProductWorkspace } from "@/components/landing/ProductWorkspace";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustPillars } from "@/components/landing/TrustPillars";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <HowItWorks />
        <ProductWorkspace />
        <TrustPillars />
      </main>
      <SiteFooter />
    </>
  );
}
