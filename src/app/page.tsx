import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { HeroSection } from "@/components/shared/marketing/hero-section";
import { TrustedBySection } from "@/components/shared/marketing/trusted-by-section";
import { StatsSection } from "@/components/shared/marketing/stats-section";
import { AudienceSection } from "@/components/shared/marketing/audience-section";
import { FeaturesSection } from "@/components/shared/marketing/features-section";
import { AiShowcaseSection } from "@/components/shared/marketing/ai-showcase-section";
import { DemoSection } from "@/components/shared/marketing/demo-section";
import { TestimonialsSection } from "@/components/shared/marketing/testimonials-section";
import { PricingSection } from "@/components/shared/marketing/pricing-section";
import { FlexibilitySection } from "@/components/shared/marketing/flexibility-section";
import { ComparisonSection } from "@/components/shared/marketing/comparison-section";
import { FaqSection } from "@/components/shared/marketing/faq-section";
import { FinalCtaSection } from "@/components/shared/marketing/final-cta-section";
import { FAQ_ITEMS } from "@/constants/marketing";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, DEFAULT_KEYWORDS, OG_IMAGE } from "@/constants/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Créez, partagez et analysez vos évaluations en ligne`,
  description:
    "Plateforme d'évaluation nouvelle génération. Créez des quiz interactifs, générez des questions avec l'IA, analysez les résultats en temps réel. Gratuit et sans engagement.",
  keywords: [
    ...DEFAULT_KEYWORDS,
    "quiz gratuit sans inscription",
    "générer questions IA",
    "plateforme examen en ligne gratuite",
    "quiz interactif éducation",
    "évaluation entreprise en ligne",
    "analytics résultats quiz",
    "multi-tenant évaluation",
  ],
  openGraph: {
    title: `${SITE_NAME} — Créez, partagez et analysez vos évaluations`,
    description:
      "Plateforme d'évaluation nouvelle génération avec IA intégrée, analytics avancés et architecture multi-tenant. Gratuit.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Plateforme d'évaluation en ligne`,
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Créez et analysez vos évaluations en ligne`,
    description:
      "Plateforme d'évaluation nouvelle génération avec IA intégrée, analytics avancés et multi-tenant.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: OG_IMAGE,
  description: SITE_DESCRIPTION,
  sameAs: [],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: SITE_DESCRIPTION,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "XOF",
    description: "Plan gratuit disponible",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <TrustedBySection />
        <StatsSection />
        <AudienceSection />
        <FeaturesSection />
        <AiShowcaseSection />
        <DemoSection />
        <TestimonialsSection />
        <PricingSection />
        <FlexibilitySection />
        <ComparisonSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
