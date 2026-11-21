import type { MetadataRoute } from "next";
import { docsSource } from "@/lib/docs";
import { docsPagePaths } from "@/lib/docs-seo";
import { absoluteLocaleUrls, siteOrigin, sitePagePaths, sitePages } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  if (!origin) return [];

  const guideSlugs = new Map<string, string[]>();
  for (const { pages } of docsSource.getLanguages()) {
    for (const page of pages) guideSlugs.set(JSON.stringify(page.slugs), page.slugs);
  }

  const paths = [...sitePages.map(sitePagePaths), ...Array.from(guideSlugs.values(), docsPagePaths)];
  const urls = new Set(paths.flatMap((page) => Object.values(absoluteLocaleUrls(page, origin))));

  // Keep the XML compatible with the base Sitemap XSD; pages declare hreflang in HTML.
  return Array.from(urls, (url) => ({ url }));
}
