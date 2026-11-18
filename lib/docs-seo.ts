import { docsSource } from "./docs";
import { locales } from "./i18n";
import type { LocalizedPaths } from "./site-metadata";

export function docsPagePaths(slugs: string[]): LocalizedPaths {
  const paths: LocalizedPaths = {};
  for (const locale of locales) {
    const page = docsSource.getPage(slugs, locale);
    if (page) paths[locale] = page.url;
  }
  return paths;
}
