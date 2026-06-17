import type { MetadataRoute } from "next";

export const revalidate = 86400;

const sitemapBaseUrl = "https://sunulogis.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: sitemapBaseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
