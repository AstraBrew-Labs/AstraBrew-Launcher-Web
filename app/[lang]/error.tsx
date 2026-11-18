"use client";
import { PageMotion } from "@/components/site/page-motion";
import { useParams } from "next/navigation";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { const en = useParams()?.lang === "en"; return <main id="main-content" className="site-message" data-transit-message><PageMotion page="message" /><h1>{en ? "Could not load this page" : "页面加载失败"}</h1><p>{en ? "Please try again. If the problem continues, return to the home page." : "请重试。如果问题仍然存在，请返回首页。"}</p><button onClick={reset}>{en ? "Try again" : "重试"}</button></main>; }
