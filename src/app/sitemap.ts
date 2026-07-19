import type { MetadataRoute } from "next";
import { SITE_URL, SITE_NAME } from "@/constants/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const publicPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  return publicPages;
}
