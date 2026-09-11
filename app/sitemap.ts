import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    return [];
  }

  const baseUrl = siteUrl.replace(/\/$/, "");

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/bans`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rules`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/appeals`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
