/** Language and regional preferences shared by the proxy and client UI. */
export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export type Region = "cn" | "international";

export const LOCALE_COOKIE = "astrabrew-locale";
export const REGION_COOKIE = "astrabrew-region";
export const LOCALE_STORAGE_KEY = "astrabrew-locale";
export const REGION_STORAGE_KEY = "astrabrew-region";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "zh" || value === "en";
}

export function isRegion(value: string | null | undefined): value is Region {
  return value === "cn" || value === "international";
}

/** Only trust country headers after the deployment platform has been configured. */
export function getCountry(headers: Pick<Headers, "get">): string | null {
  const provider = process.env.GEO_PROVIDER?.toLowerCase();
  const header = provider === "cloudflare"
    ? "cf-ipcountry"
    : provider === "vercel"
      ? "x-vercel-ip-country"
      : null;
  const country = header ? headers.get(header)?.trim().toUpperCase() : null;
  return country && /^[A-Z]{2}$/.test(country) && country !== "XX" && country !== "ZZ"
    ? country
    : null;
}

export function regionFromCountry(country: string): Region {
  return country.toUpperCase() === "CN" ? "cn" : "international";
}

/** Parse language preferences by quality. A Chinese locale is a regional hint, not location proof. */
export function regionFromAcceptLanguage(value: string | null | undefined): Region {
  const languages = (value ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const quality = params.find((param) => param.trim().startsWith("q="))?.trim().slice(2);
      const q = quality === undefined ? 1 : Number(quality);
      return { tag, q: Number.isFinite(q) ? q : 0, index };
    })
    .filter(({ tag, q }) => tag && tag !== "*" && q > 0 && q <= 1)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  const tag = languages[0]?.tag;
  return tag === "zh" || tag === "zh-cn" || tag?.startsWith("zh-hans")
    ? "cn"
    : "international";
}

/** The server cannot read browser time zone; use this only after hydration. */
export function regionFromBrowser(language: string, timeZone?: string): Region {
  if (timeZone && /^(Asia\/(Shanghai|Chongqing|Harbin|Urumqi))$/i.test(timeZone)) return "cn";
  if (timeZone) return "international";
  return regionFromAcceptLanguage(language);
}

export function resolveRegion({
  country,
  browserRegion,
  acceptLanguage,
}: {
  country?: string | null;
  browserRegion?: string | null;
  acceptLanguage?: string | null;
}): Region {
  if (country) return regionFromCountry(country);
  if (isRegion(browserRegion)) return browserRegion;
  return regionFromAcceptLanguage(acceptLanguage);
}

export function resolveLocale({
  preference,
  region,
}: {
  preference?: string | null;
  region: Region;
}): Locale {
  return isLocale(preference) ? preference : region === "cn" ? "zh" : "en";
}

export function localeFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

export function localizedPath(locale: Locale, pathname = "/"): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const current = localeFromPath(path);
  const suffix = current ? path.slice(current.length + 1) : path;
  return `/${locale}${suffix === "/" ? "" : suffix}` || `/${locale}`;
}

/** Recognize the same page in a different supported locale. */
export function isLocaleExchange(from: string, to: string) {
  const current = localeFromPath(from);
  const next = localeFromPath(to);
  const normalize = (path: string) => path.replace(/\/$/, "");
  return !!current && !!next && next !== current && normalize(localizedPath(next, from)) === normalize(to);
}

/** Called in the language switcher; cookie keeps server redirects consistent. */
export function saveLocalePreference(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Cookies may still work when storage is unavailable.
  }
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

/** Persist a browser approximation for subsequent server requests. */
export function saveBrowserRegion(region: Region): void {
  try {
    window.localStorage.setItem(REGION_STORAGE_KEY, region);
  } catch {
    // Continue without local storage.
  }
  document.cookie = `${REGION_COOKIE}=${region}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
