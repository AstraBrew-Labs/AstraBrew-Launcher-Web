"use client";
import { PageMotion } from "@/components/site/page-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
export default function NotFound() { const en = useParams()?.lang === "en"; return <main id="main-content" className="site-message" data-transit-message><PageMotion page="message" /><h1>{en ? "Page not found" : "页面未找到"}</h1><p>{en ? "This page may have moved or the address may be incorrect." : "页面可能已移动，或地址输入有误。"}</p><Link href={en ? "/en" : "/zh"}>{en ? "Back to home" : "返回首页"}</Link></main>; }
