export const SITE_NAME = "QuizNest";
export const SITE_URL = "https://quiznest-six.vercel.app";
export const SITE_DESCRIPTION =
  "QuizNest — plateforme d'évaluation nouvelle génération. Créez, partagez et analysez vos quiz avec IA intégrée, analytics avancés et multi-tenant. Gratuit et sans engagement.";

export const DEFAULT_KEYWORDS = [
  "quiz en ligne",
  "créer un quiz",
  "évaluation en ligne",
  "plateforme de quiz",
  "quiz gratuit",
  "test en ligne",
  "examen en ligne",
  "qcm en ligne",
  "génération IA de questions",
  "analytics évaluations",
  "quiz entreprise",
  "quiz éducation",
  "partage quiz",
  "résultats quiz",
  "quiz interactif",
  "plateforme évaluation",
  "IA quiz",
  "évaluation formation",
];

export const OG_IMAGE = `${SITE_URL}/og.png`;

export function buildMetadata(opts: {
  title: string;
  description?: string;
  keywords?: string[];
  path?: string;
  ogImage?: string;
  noindex?: boolean;
}) {
  const description = opts.description ?? SITE_DESCRIPTION;
  const url = opts.path ? `${SITE_URL}${opts.path}` : SITE_URL;
  const image = opts.ogImage ?? OG_IMAGE;

  return {
    title: opts.title,
    description,
    keywords: opts.keywords ?? DEFAULT_KEYWORDS,
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: opts.title,
      description,
      images: [image],
    },
    robots: {
      index: !opts.noindex,
      follow: !opts.noindex,
      googleBot: {
        index: !opts.noindex,
        follow: !opts.noindex,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}
