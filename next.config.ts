import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/guide", destination: "/zh/docs", permanent: true },
      { source: "/:lang(zh|en)/guide", destination: "/:lang/docs", permanent: true },
      { source: "/about", destination: "/zh", permanent: true },
      { source: "/:lang(zh|en)/about", destination: "/:lang", permanent: true },
      { source: "/images/og.png", destination: "/brand/og/home-zh-v1.png", permanent: true },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default createMDX()(nextConfig);
