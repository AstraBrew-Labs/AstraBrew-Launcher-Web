"use client";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { PageMotion } from "@/components/site/page-motion";
import { DocumentBootstrap } from "@/components/site/document-bootstrap";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";
import "./theme.css";
const subscribe = () => () => {};
const getLanguage = () => !window.location.pathname.startsWith("/zh");
const serverLanguage = () => true;
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const en = useSyncExternalStore(subscribe, getLanguage, serverLanguage);
  useLayoutEffect(() => {
    try { document.documentElement.dataset.theme = localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light"; }
    catch { /* Storage may be unavailable. */ }
  }, []);
  return <html lang={en ? "en" : "zh-CN"} suppressHydrationWarning><body><DocumentBootstrap /><main id="main-content" className="site-message" data-transit-message><PageMotion page="message" /><h1>{en ? "Could not load this page" : "页面加载失败"}</h1><p>{en ? "Please try again." : "请重试。"}</p><button onClick={reset}>{en ? "Try again" : "重试"}</button></main></body></html>;
}
