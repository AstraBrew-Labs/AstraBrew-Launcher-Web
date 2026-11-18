"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { themeBootstrap } from "@/lib/theme";

const introBootstrap = `try{if(window.__astrabrewIntroInitialized)return;window.__astrabrewIntroInitialized=true;var nav=performance.getEntriesByType('navigation')[0];if(nav?.type!=='back_forward'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){var root=document.documentElement;root.classList.add('reload-intro-active');setTimeout(function(){if(!document.querySelector('.boot-screen[data-running]'))root.classList.remove('reload-intro-active')},4500)}}catch{}`;

/** Parser-time setup only. Soft navigation must not mount an executable script. */
export function DocumentBootstrap({ intro = false }: { intro?: boolean }) {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: `(()=>{${themeBootstrap};${intro ? introBootstrap : ""}})()` }} />;
  });
  return null;
}
