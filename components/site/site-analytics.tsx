import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export function SiteAnalytics() {
  // Vercel previews also use NODE_ENV=production; don't send their visits.
  const vercelEnv = process.env.VERCEL_ENV;
  if (process.env.NODE_ENV !== "production" || (vercelEnv && vercelEnv !== "production")) return null;

  const cloudflareToken = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();

  return (
    <>
      {vercelEnv === "production" && <Analytics />}
      {cloudflareToken && (
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="lazyOnload"
          data-cf-beacon={JSON.stringify({ token: cloudflareToken })}
        />
      )}
    </>
  );
}
