import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

// Queue initialization before the async container can read the data layer.
const googleTagManagerBootstrap = `(() => {
  const scriptId = "google-tag-manager-container";
  if (document.getElementById(scriptId)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  const startedAt = new Date();
  window.gtag("js", startedAt);
  window.dataLayer.push({ "gtm.start": startedAt.getTime(), event: "gtm.js" });

  const script = document.createElement("script");
  script.id = scriptId;
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-MLXXG558";
  document.head.appendChild(script);
})();`;

export function SiteAnalytics() {
  // Vercel previews also use NODE_ENV=production; don't send their visits.
  const vercelEnv = process.env.VERCEL_ENV;
  if (process.env.NODE_ENV !== "production" || (vercelEnv && vercelEnv !== "production")) return null;

  const cloudflareToken = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();

  return (
    <>
      {vercelEnv === "production" && <Analytics />}
      <Script id="google-tag-manager-bootstrap" strategy="afterInteractive">
        {googleTagManagerBootstrap}
      </Script>
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
