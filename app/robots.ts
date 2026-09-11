import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/bans", "/rules", "/appeals"],
      disallow: ["/staff", "/api", "/sign-in"],
    },
    ...(siteUrl
      ? {
          sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
        }
      : {}),
  };
}
