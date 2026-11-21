import Link from "next/link";
import type { Locale } from "@/lib/i18n";
export function SiteFooter({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return <footer className="site-footer"><div className="site-footer-inner"><div><strong>AstraBrew Launcher</strong><p>{en ? "A simpler start for your SillyTavern." : "让你的酒馆之旅，简单开始。"}</p></div><div className="site-footer-links"><Link href={`/${locale}/download`}>{en ? "Downloads" : "版本下载"}</Link><Link href={`/${locale}/docs`} prefetch={false}>{en ? "User guide" : "使用文档"}</Link><Link href={`/${locale}/license`}>{en ? "Open source license" : "开源协议"}</Link><Link href={`/${locale}/about`}>{en ? "About us" : "关于我们"}</Link><a href="https://github.com/AstraBrew-Labs/AstraBrew-Launcher-Win" target="_blank" rel="noreferrer">GitHub</a><a href="https://gitcode.com/AstraBrew-Labs/AstraBrew-Launcher-Win" target="_blank" rel="noreferrer">GitCode</a></div><small>© AstraBrew Labs</small></div></footer>;
}
