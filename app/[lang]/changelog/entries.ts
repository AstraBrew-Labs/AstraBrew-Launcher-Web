import type { Locale } from "@/lib/i18n";

type Localized = Record<Locale, string>;
type Update = {
  id: string;
  date: string;
  kind: "website" | "experience" | "maintenance";
  title: Localized;
  notes: Localized[];
};

/** Website milestones, newest first. Use YYYY-MM-DD and keep IDs stable in both languages. */
export const updates: readonly Update[] = [
  {
    id: "update-timeline", date: "2026-11-21", kind: "website",
    title: { zh: "网站更新有了单独的时间线", en: "A timeline for website updates" },
    notes: [
      { zh: "从右上角的图标打开更新日志，按时间回顾官网的变化。", en: "Open the changelog from the icon in the header to see how the website has changed over time." },
      { zh: "滚动页面或拖动滑动条，都可以浏览同一条时间线。", en: "Scroll the page or drag the slider to explore the same timeline." },
    ],
  },
  {
    id: "logo-and-about", date: "2026-11-21", kind: "experience",
    title: { zh: "开屏 Logo 动画与关于我们", en: "A new opening animation and About page" },
    notes: [
      { zh: "开屏 Logo 完成描边和填色后滑入左上角，遮罩再从 Logo 中心向外展开，揭开首页。", en: "The opening logo draws and fills, then docks in the header. A circular reveal expands from the logo to uncover the homepage." },
      { zh: "新增中英文「关于我们」页面，介绍启动器的由来，并附上初版项目和星酿工坊官网的链接。", en: "The bilingual About page tells the story behind the launcher and links to the original project and AstraBrew Labs." },
    ],
  },
  {
    id: "search-and-sharing", date: "2026-11-19", kind: "maintenance",
    title: { zh: "完善搜索索引与分享预览", en: "Improved search indexing and sharing" },
    notes: [
      { zh: "为主要栏目完善中英文搜索元数据、站点地图和分享卡片。", en: "The main sections now have locale-specific search metadata and social cards, along with sitemap coverage." },
      { zh: "修正切换页面后保留的内容结构，让页面主标题和主要内容对应当前路由。", en: "Fixed retained page landmarks so the main heading and content match the active route after navigation." },
    ],
  },
  {
    id: "first-paint", date: "2026-11-19", kind: "maintenance",
    title: { zh: "改善首屏加载与可访问性", en: "Faster first paint and improved accessibility" },
    notes: [
      { zh: "优化首屏样式和字体的加载顺序，同时保留减少动态效果的设置。", en: "Improved the initial loading order for styles and fonts while honoring reduced-motion preferences." },
      { zh: "接入 Vercel 与 Cloudflare 网站访问统计，按部署环境启用。", en: "Added Vercel and Cloudflare website analytics, enabled according to deployment configuration." },
    ],
  },
  {
    id: "website-redesign", date: "2026-11-19", kind: "website",
    title: { zh: "新版星酿启动器官网上线", en: "The redesigned launcher website goes live" },
    notes: [
      { zh: "重做产品首页、版本下载与开源协议页面，并扩充中英文使用文档。", en: "Redesigned the product, download, and license pages and expanded the bilingual user guide." },
      { zh: "下载页优先读取本地缓存，保留到期自动同步与手动刷新。", en: "The download page reads cached releases first, refreshes stale data automatically, and still supports manual refresh." },
    ],
  },
];
