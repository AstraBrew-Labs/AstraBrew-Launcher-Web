import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
