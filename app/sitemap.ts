import type { MetadataRoute } from "next";
import { docsSource } from "@/lib/docs";
import { docsPagePaths } from "@/lib/docs-seo";
import { absoluteLocaleUrls, languageAlternates, siteOrigin, sitePagePaths, sitePages } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  if (!origin) return [];

  const guideSlugs = new Map<string, string[]>();
  for (const { pages } of docsSource.getLanguages()) {
    for (const page of pages) guideSlugs.set(JSON.stringify(page.slugs), page.slugs);
  }

  return [...sitePages.map(sitePagePaths), ...Array.from(guideSlugs.values(), docsPagePaths)].flatMap((paths) => {
    const urls = absoluteLocaleUrls(paths, origin);
    const languages = languageAlternates(urls);
    return Object.values(urls).map((url) => ({ url, ...(languages ? { alternates: { languages } } : {}) }));
  });
}
