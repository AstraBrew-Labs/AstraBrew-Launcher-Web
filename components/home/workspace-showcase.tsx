"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Boxes, Check, FolderCog, Layers3, Monitor, RefreshCw, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const icons = [FolderCog, Boxes, RefreshCw];

export function WorkspaceShowcase({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const [active, setActive] = useState(0);
  const visual = useRef<HTMLDivElement>(null);
  const previousTab = useRef(active);
  const items = en ? [
    { title: "Environment", heading: "A clearer place to begin.", description: "Bring the environment settings for SillyTavern together, so you can spend less time hunting through folders.", labels: ["Runtime environment", "Launch settings", "Configuration"] },
    { title: "Instances", heading: "Keep your taverns organized.", description: "Manage your SillyTavern instances and their settings from one familiar workspace.", labels: ["Instance overview", "Tavern settings", "Local resources"] },
    { title: "Versions", heading: "Keep track as things change.", description: "See and manage versions as your setup evolves, with the details close at hand.", labels: ["Version overview", "Available releases", "Version management"] },
  ] : [
    { title: "环境配置", heading: "从一个清晰的起点开始。", description: "把酒馆运行所需的环境配置收在一起，不必在不同文件夹之间反复寻找。", labels: ["运行环境", "启动设置", "配置管理"] },
    { title: "实例管理", heading: "把每个酒馆整理妥当。", description: "在熟悉的工作台里管理 SillyTavern 实例与配置，让常用操作更容易找到。", labels: ["实例概览", "酒馆配置", "本地资源"] },
    { title: "版本管理", heading: "变化，都在掌握之中。", description: "随着使用需求变化，查看和管理版本，让需要的信息始终清晰可见。", labels: ["版本概览", "可用版本", "版本管理"] },
  ];
  const current = items[active];
  useGSAP(() => {
    if (previousTab.current === active) return;
    previousTab.current = active;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(visual.current, { opacity: 0.35, y: 12 }, { opacity: 1, y: 0, duration: 0.42, ease: "power3.out", clearProps: "transform,opacity" });
  }, { scope: visual, dependencies: [active], revertOnUpdate: true });

  return <section className="home-workspace" aria-labelledby="workspace-title">
    <div className="home-workspace-inner">
      <div className="home-workspace-heading"><div><p className="home-section-label">{en ? "A workspace for your tavern" : "你的酒馆工作台"}</p><h2 id="workspace-title">{en ? <>Everything has<br />its place.</> : <>每件事，<br />都有它的位置。</>}</h2></div><p>{en ? "From the first setup to everyday management, find the essentials in one place." : "从第一次配置，到之后的日常管理，把需要的事放在同一个地方。"}</p></div>
      <div className="home-workspace-grid">
        <div className="home-workspace-copy">
          <div className="home-workspace-tabs" role="group" aria-label={en ? "Explore workspace features" : "查看工作台功能"}>{items.map((item, index) => { const Icon = icons[index]; return <button type="button" key={item.title} aria-pressed={active === index} onClick={() => setActive(index)}><Icon size={18} aria-hidden="true" /><span>{item.title}</span><span className="home-workspace-tab-arrow" aria-hidden="true">↗</span></button>; })}</div>
          <div className="home-workspace-detail" aria-live="polite"><h3>{current.heading}</h3><p>{current.description}</p></div>
        </div>
        <div className="home-workspace-art" aria-label={en ? "Illustration of workspace features" : "工作台功能示意图"}>
          <div className="home-workspace-glow" aria-hidden="true" />
          <div className="home-workspace-panel" ref={visual}>
            <div className="home-workspace-panel-top"><span className="home-workspace-brand"><Sparkles size={15} aria-hidden="true" /> AstraBrew</span><span>{en ? "Workspace overview" : "工作台概览"}</span></div>
            <div className="home-workspace-panel-main"><div className="home-workspace-panel-icon">{active === 0 ? <Monitor size={27} /> : active === 1 ? <Boxes size={27} /> : <Layers3 size={27} />}</div><div><span>{en ? "Your workspace" : "你的工作空间"}</span><strong>{current.title}</strong></div></div>
            <div className="home-workspace-rows">{current.labels.map((label) => <div key={label}><span><Check size={14} aria-hidden="true" /></span>{label}<span aria-hidden="true">↗</span></div>)}</div>
            <div className="home-workspace-panel-foot"><span>{en ? "Illustration" : "功能示意"}</span><span>AstraBrew Launcher</span></div>
          </div>
          <div className="home-workspace-floating" aria-hidden="true"><Sparkles size={17}/><span>{en ? "Made for your tavern" : "为你的酒馆而造"}</span></div>
        </div>
      </div>
    </div>
  </section>;
}
