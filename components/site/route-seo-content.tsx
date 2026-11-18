"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Keep a route's H1 and structured data in SSR, but not in cached, inactive pages. */
export function RouteSeoContent({ path, children }: { path: string; children: ReactNode }) {
  const pathname = usePathname();
  return pathname?.replace(/\/$/, "") === path ? children : null;
}
