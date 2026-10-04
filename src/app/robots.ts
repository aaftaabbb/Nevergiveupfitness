import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin pages hold member data and must never appear in search results.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}