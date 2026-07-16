import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { HeroSection } from "@/components/shared/marketing/hero-section";
import { AudienceSection } from "@/components/shared/marketing/audience-section";
import { FeaturesSection } from "@/components/shared/marketing/features-section";
import { TestimonialsSection } from "@/components/shared/marketing/testimonials-section";
import { PricingSection } from "@/components/shared/marketing/pricing-section";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <AudienceSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <SiteFooter />
    </>
  );
}
