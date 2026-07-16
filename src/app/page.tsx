import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { HeroSection } from "@/components/shared/marketing/hero-section";
import { TrustedBySection } from "@/components/shared/marketing/trusted-by-section";
import { AudienceSection } from "@/components/shared/marketing/audience-section";
import { FeaturesSection } from "@/components/shared/marketing/features-section";
import { DemoSection } from "@/components/shared/marketing/demo-section";
import { TestimonialsSection } from "@/components/shared/marketing/testimonials-section";
import { PricingSection } from "@/components/shared/marketing/pricing-section";
import { FaqSection } from "@/components/shared/marketing/faq-section";
import { FinalCtaSection } from "@/components/shared/marketing/final-cta-section";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <TrustedBySection />
        <AudienceSection />
        <FeaturesSection />
        <DemoSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
