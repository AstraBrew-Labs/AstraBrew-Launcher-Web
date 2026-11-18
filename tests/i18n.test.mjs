import { describe, expect, test } from "bun:test";
import {
  getCountry,
  isLocale,
  isLocaleExchange,
  localizedPath,
  regionFromAcceptLanguage,
  regionFromBrowser,
  resolveLocale,
  resolveRegion,
} from "../lib/i18n.ts";

describe("locale and region selection", () => {
  test("a saved language overrides location", () => {
    expect(resolveLocale({ preference: "en", region: "cn" })).toBe("en");
    expect(resolveLocale({ preference: "invalid", region: "cn" })).toBe("zh");
    expect(isLocale("ZH")).toBe(false);
  });

  test("the trusted country precedes browser approximations", () => {
    expect(resolveRegion({ country: "CN", browserRegion: "international" })).toBe("cn");
    expect(resolveRegion({ country: "US", browserRegion: "cn" })).toBe("international");
    expect(resolveRegion({ browserRegion: "cn", acceptLanguage: "en-US" })).toBe("cn");
  });

  test("browser and accept-language hints are deterministic", () => {
    expect(regionFromAcceptLanguage("en;q=0.3, zh-CN;q=0.9")).toBe("cn");
    expect(regionFromAcceptLanguage("zh-TW,zh;q=0.9")).toBe("international");
    expect(regionFromBrowser("en-US", "Asia/Shanghai")).toBe("cn");
    expect(regionFromBrowser("zh-CN", "America/New_York")).toBe("international");
  });

  test("platform headers require explicit configuration", () => {
    const prior = process.env.GEO_PROVIDER;
    const headers = new Headers({ "cf-ipcountry": "CN", "x-vercel-ip-country": "US" });
    try {
      delete process.env.GEO_PROVIDER;
      expect(getCountry(headers)).toBeNull();
      process.env.GEO_PROVIDER = "cloudflare";
      expect(getCountry(headers)).toBe("CN");
      process.env.GEO_PROVIDER = "vercel";
      expect(getCountry(headers)).toBe("US");
    } finally {
      if (prior === undefined) delete process.env.GEO_PROVIDER;
      else process.env.GEO_PROVIDER = prior;
    }
  });

  test("prefixes and changes language without losing nested paths", () => {
    expect(localizedPath("zh", "/download")).toBe("/zh/download");
    expect(localizedPath("en", "/zh/download")).toBe("/en/download");
    expect(localizedPath("en", "/zh/")).toBe("/en");
  });
  test("distinguishes language changes from normal navigation", () => {
    expect(isLocaleExchange("/zh/", "/en")).toBe(true);
    expect(isLocaleExchange("/en/docs/installation", "/zh/docs/installation")).toBe(true);
    expect(isLocaleExchange("/en/docs", "/en/docs/installation")).toBe(false);
    expect(isLocaleExchange("/en/docs", "/zh/download")).toBe(false);
    expect(isLocaleExchange("/fr/docs", "/en/docs")).toBe(false);
  });
});
