"use client";

import { useEffect, useRef, useState } from "react";
import { Boxes, ChevronDown, Copy, Folder, Gauge, Globe, History, Info, Menu, Minus, Play, RefreshCw, Settings, Square, TerminalSquare, UserRound, X } from "lucide-react";
import "./product-demo.css";

type DemoLocale = "zh" | "en";

/** A self-contained, illustrative recreation of the Windows client. */
export function ProductDemo({ locale = "zh" }: { locale?: DemoLocale }) {
  const [scale, setScale] = useState(0.5);
  const wrapper = useRef<HTMLDivElement>(null);
  const en = locale === "en";
  const t = (zh: string, english: string) => en ? english : zh;

  useEffect(() => {
    const node = wrapper.current;
    if (!node) return;
    const update = () => setScale(node.clientWidth / 1456);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const navigation = [
    [Gauge, t("仪表盘", "Dashboard")],
    [Settings, t("酒馆配置", "Tavern settings")],
    [History, t("版本管理", "Versions")],
    [Boxes, t("扩展管理", "Extensions")],
    [Folder, t("资源管理", "Resources")],
  ] as const;
  const stats = [
    { label: t("当前版本", "Current version"), value: "v1.19.0", sub: t("内置酒馆 · 已是最新", "Built-in tavern · Up to date"), Icon: History },
    { label: t("已装扩展", "Extensions"), value: "17", sub: t("内置 14 · 第三方 3", "14 built-in · 3 third-party"), Icon: Boxes },
    { label: t("角色卡", "Character cards"), value: t("3 张", "3"), sub: t("共 2.6 MB", "2.6 MB total"), Icon: UserRound },
    { label: t("磁盘占用", "Disk usage"), value: "455.6 MB", sub: t("安装 421.9 MB · 数据 33.7 MB", "App 421.9 MB · Data 33.7 MB"), Icon: Minus },
  ];

  return <section className={"pd_demo"} aria-label={t("Windows 启动器界面演示", "Windows launcher interface demonstration")}>
    <div className={"pd_toolbar"}>
      <span>{t("Windows 版界面演示", "Windows interface demo")}</span>
    </div>
    <div ref={wrapper} className={"pd_viewport"} style={{height: `${800 * scale}px`}}>
      <div className={"pd_window"} style={{transform: `scale(${scale})`}} aria-hidden="true">
        <div className={"pd_titlebar"}>
          <div className={"pd_productMark"}><span className={"pd_mark"}>✦<b>›</b></span><strong>AstraBrew Launcher</strong><span className={"pd_devTag"}>{t("开发版", "Dev")}</span><span className={"pd_titleDivider"}/><span className={"pd_titleMuted"}>{t("酒馆启动器", "Tavern launcher")}</span><span className={"pd_titleDivider"}/><span className={"pd_versionTag"}>{t("内置", "Built-in")} · v1.19.0</span></div>
          <div className={"pd_windowControls"}><Minus/><Square/><X/></div>
        </div>
        <div className={"pd_appBody"}>
          <aside className={"pd_sidebar"}>
            <div className={"pd_menu"}><Menu/></div>
            <div className={"pd_navList"}>{navigation.map(([Icon, label], index) => <div key={label} className={`pd_navItem ${index === 0 ? "pd_active" : ""}`}><Icon/><span>{label}</span></div>)}</div>
            <div className={"pd_bottomNav"}>
              <div className={"pd_navItem"}><TerminalSquare/><span>{t("控制台", "Console")}</span></div>
              <div className={"pd_navItem"}><Settings/><span>{t("设置", "Settings")}</span></div>
              <div className={"pd_navItem"}><Info/><span>{t("关于", "About")}</span></div>
            </div>
          </aside>
          <main className={"pd_content"}>
            <header className={"pd_heading"}><div><h2>{t("仪表盘", "Dashboard")}</h2><p>{t("服务状态、启动配置与常用操作", "Service status, launch settings, and common actions")}</p></div><div className={"pd_sync"}>{t("最后同步", "Last synced")} 00:27:06 <RefreshCw/></div></header>
            <section className={"pd_service"}>
              <div className={"pd_statusLine"}><span className={"pd_statusDot"}/><strong>{t("服务已停止", "Service stopped")}</strong><span className={"pd_tag"}>{t("内置", "Built-in")} · v1.19.0</span></div>
              <div className={"pd_url"}><Globe/> http://127.0.0.1:11451 <Copy/></div>
              <span className={"pd_launch"}><Play/> {t("启动服务", "Start service")}</span>
              <div className={"pd_running"}><span>{t("已持续运行", "Running for")}</span><strong>--:--:--</strong><span>PID —</span></div>
              <div className={"pd_measurements"}>{[[t("内存占用", "Memory"), "—"], ["CPU", "—"], [t("今日访问", "Visits today"), "0"], [t("启动耗时", "Startup time"), "—"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
            </section>
            <div className={"pd_statGrid"}>{stats.map(({label, value, sub, Icon}) => <div className={"pd_stat"} key={label}><div className={"pd_statLabel"}>{label}<Icon/></div><strong>{value}</strong><span>{sub}</span></div>)}</div>
            <section className={"pd_configuration"}><h3>{t("启动配置", "Launch configuration")}</h3><p>{t("选择酒馆版本与运行模式，保存后下次启动生效", "Choose a tavern version and run mode for the next launch")}</p><div className={"pd_configGrid"}><div><div className={"pd_configLabel"}>{t("酒馆版本", "Tavern version")}<span>{t("管理版本", "Manage versions")}</span></div><div className={"pd_select"}>{t("内置酒馆", "Built-in tavern")}<ChevronDown/></div><div className={"pd_configDetails"}><b>{t("内置", "Built-in")}</b>　{t("内核", "Core")} v1.19.0<br/><span>C:\Users\Example\AppData\Roaming\AstraBrew Launcher\sillytavern</span><br/>{t("运行环境 · 系统环境 · Node v22.12.0", "Runtime · System environment · Node v22.12.0")}</div></div><div className={"pd_mode"}><div><strong>{t("模式设置", "Mode settings")}</strong><span>{t("普通模式", "Standard")}</span></div><p>{t("默认浏览器", "Default browser")}</p><div className={"pd_browserChoices"}><span>{t("谷歌浏览器", "Chrome")}</span><span>Edge</span><span>{t("火狐浏览器", "Firefox")}</span></div></div></div></section>
          </main>
        </div>
      </div>
    </div>
    <p className={"pd_disclaimer"}>{t("根据 Windows 版界面制作的交互演示，数据为示例。", "Interactive recreation of the Windows interface. Data shown is illustrative.")}</p>
  </section>;
}
