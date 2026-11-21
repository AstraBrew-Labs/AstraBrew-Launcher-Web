import { expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { LOCALE_COOKIE } from "../lib/i18n.ts";
import nextConfig from "../next.config.ts";
import { proxy } from "../proxy.ts";

for (const locale of ["zh", "en"]) {
  test(`/about follows the ${locale} preference and preserves its query`, () => {
    const origin = "https://launcher.astrabrew.cn";
    const entry = proxy(new NextRequest(`${origin}/about?ref=test`, {
      headers: { cookie: `${LOCALE_COOKIE}=${locale}` },
    }));
    expect(entry.status).toBe(307);
    expect(entry.headers.get("location")).toBe(`${origin}/${locale}/about?ref=test`);
    expect(entry.headers.get("cache-control")).toBe("private, no-store");
    const localized = proxy(new NextRequest(`${origin}/${locale}/about`));
    expect(localized.headers.get("location")).toBeNull();
    expect(localized.headers.get("x-middleware-next")).toBe("1");
  });
}

test("no legacy about redirect overrides the localized page", async () => {
  const redirects = await nextConfig.redirects();
  expect(redirects.some(({ source }) => source.endsWith("/about"))).toBe(false);
});
