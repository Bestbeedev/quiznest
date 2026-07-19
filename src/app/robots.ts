import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/onboarding/",
          "/invite/",
          "/q/*/play",
          "/q/*/result",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
