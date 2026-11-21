"use client";

import { History } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type PointerEvent } from "react";
import { localizedPath, type Locale } from "@/lib/i18n";
import { IconTooltip } from "./icon-tooltip";
import "./site-navigation.css";

const pages = [
  { path: "/", zh: "产品介绍", en: "Features" },
  { path: "/download", zh: "版本下载", en: "Downloads" },
  { path: "/docs", zh: "使用文档", en: "User guide", nested: true },
  { path: "/license", zh: "开源协议", en: "License" },
  { path: "/about", zh: "关于我们", en: "About us" },
] as const;

type Props = { locale: Locale };

export function SiteNavigation({ locale }: Props) {
  const pathname = usePathname()?.replace(/\/$/, "");
  return <SiteNavLinks locale={locale} pathname={pathname} />;
}

function placeHoverPlate(plate: HTMLSpanElement, link: HTMLAnchorElement) {
  const nav = plate.parentElement;
  if (!nav) return;
  const { left, width } = link.getBoundingClientRect();
  // Keep subpixel widths and measure in the scrolling nav's coordinates.
  const x = left - nav.getBoundingClientRect().left + nav.scrollLeft - nav.clientLeft;
  plate.style.setProperty("--nav-hover-x", `${x}px`);
  plate.style.setProperty("--nav-hover-width", `${width}px`);
}

export function SiteNavLinks({ locale, pathname }: Props & { pathname?: string }) {
  const nav = useRef<HTMLElement>(null);
  const hoverPlate = useRef<HTMLSpanElement>(null);
  const hovered = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const container = nav.current;
    const plate = hoverPlate.current;
    if (!container || !plate || typeof ResizeObserver === "undefined") return;
    const resize = new ResizeObserver(() => {
      if (!plate.hasAttribute("data-visible")) return;
      const item = hovered.current;
      if (!item || !container.contains(item)) {
        plate.removeAttribute("data-visible");
        return;
      }
      placeHoverPlate(plate, item);
    });
    resize.observe(container);
    container.querySelectorAll(".site-nav-link").forEach(link => resize.observe(link));
    return () => resize.disconnect();
  }, [locale]);

  useEffect(() => {
    const container = nav.current;
    if (!container || container.scrollWidth <= container.clientWidth) return;
    const current = container.querySelector<HTMLElement>(".site-nav-link[aria-current]");
    if (!current) return;

    const inset = parseFloat(getComputedStyle(container).scrollPaddingInlineStart) || 0;
    const start = current.offsetLeft - inset;
    const end = current.offsetLeft + current.offsetWidth + inset;
    const { scrollLeft, clientWidth } = container;
    // Reveal the selected item without scrolling the document or recentering visible items.
    if (start < scrollLeft) container.scrollTo({ left: start, behavior: "instant" });
    else if (end > scrollLeft + clientWidth) container.scrollTo({ left: end - clientWidth, behavior: "instant" });
  }, [locale, pathname]);

  function follow(event: PointerEvent<HTMLAnchorElement>) {
    const plate = hoverPlate.current;
    if (!plate || event.pointerType !== "mouse") return;
    hovered.current = event.currentTarget;
    // On entry, appear at the hovered item rather than flying in from the previous one.
    plate.toggleAttribute("data-glide", plate.hasAttribute("data-visible"));
    placeHoverPlate(plate, event.currentTarget);
    plate.setAttribute("data-visible", "");
  }

  function clearHover() {
    hovered.current = null;
    hoverPlate.current?.removeAttribute("data-visible");
  }

  return <nav ref={nav} className="site-nav" aria-label={locale === "en" ? "Main navigation" : "主导航"}
    onPointerLeave={clearHover} onPointerCancel={clearHover}>
    <span ref={hoverPlate} className="site-nav-hover" aria-hidden="true" />
    {pages.map(page => {
      const href = localizedPath(locale, page.path);
      const current = pathname === href ? "page" :
        "nested" in page && pathname?.startsWith(`${href}/`) ? "location" : undefined;
      return <Link key={href} className="site-nav-link" href={href} onPointerEnter={follow}
        prefetch={page.path === "/docs" ? false : undefined} aria-current={current}>{page[locale]}</Link>;
    })}
  </nav>;
}

export function ActiveChangelogLink({ locale }: Props) {
  const pathname = usePathname()?.replace(/\/$/, "");
  return <ChangelogLink locale={locale} current={pathname === localizedPath(locale, "/changelog")} />;
}

export function ChangelogLink({ locale, current }: Props & { current?: boolean }) {
  const label = locale === "en" ? "Changelog" : "更新日志";
  return <IconTooltip label={label}>
    <Link className="site-changelog" href={localizedPath(locale, "/changelog")} prefetch={false}
      aria-current={current ? "page" : undefined} aria-label={label}>
      <History size={19} aria-hidden="true" />
    </Link>
  </IconTooltip>;
}
