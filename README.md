# AstraBrew Launcher website

星酿启动器官网，使用 Next.js App Router、Fumadocs、GSAP 和 Lucide。运行环境需要 Bun。

```sh
bun install
bun run dev
```

运行 `bun run build`、`bun run lint` 和 `bun test` 验证项目。

## 部署配置

- `NEXT_PUBLIC_SITE_URL`：构建时设置生产站点的 HTTPS origin，例如 `https://launcher.example.com`。配置后输出 canonical、hreflang、Open Graph 图片与 URL、软件结构化数据和 sitemap。本仓库在 Vercel Production 未显式配置时使用官方域名 `https://launcher.astrabrew.cn`；在其他生产环境部署时应显式设置。变更后需重新构建。 `bun run dev` 未配置时会用 localhost 和开发服务的端口，便于本地 SEO 检查；正式构建不会使用这个回退。如果使用 `127.0.0.1` 或本地 HTTPS，可以用 `.env.development.local` 显式指定本地 origin。
- `GEO_PROVIDER`：仅在部署平台可信地设置地区请求头并屏蔽客户端伪造值时设置为 `cloudflare` 或 `vercel`。分别读取 `CF-IPCountry` 或 `X-Vercel-IP-Country`；未配置时使用浏览器语言与时区作为近似值。优先源为中国大陆 GitCode、其他地区 GitHub。

语言选择保存在 cookie 与本地存储中。版本列表在服务端读取公开的 Windows releases，并有超时、短期缓存与镜像回退；Mac 下载将在发布后接入。Windows 协议原文来自 `AstraBrew-Launcher-Win` 仓库的 `v2/LICENSE.txt`。

下载数据按地区保存在浏览器本地，有效期 30 分钟；过期时先展示已有数据并在后台同步。打开下载页可手动刷新；双源不可用时保留上一次的列表。服务端合并并发请求并限制短时间重复访问发布源。

## 网站访问统计

- **Vercel Web Analytics**：在 Vercel 项目的 **Analytics** 页面点击 **Enable**，确保项目开放系统环境变量（代码用 `VERCEL_ENV=production` 区分生产与预览），然后重新部署。官方 Next.js 集成已放在中英文共享布局，无需另填站点 ID。
- **Cloudflare Web Analytics**：在 **Web Analytics** 中添加或选择域名，选择手动安装 JS Snippet，把片段里 `data-cf-beacon` 的 `token` 配置为 `CLOUDFLARE_WEB_ANALYTICS_TOKEN`（Vercel 请选择 **Production** 环境），然后重新部署。如果 Cloudflare 已自动注入脚本，请把该变量留空，避免重复统计。
- **Google Tag Manager**：中英文共享布局在 hydration 后异步加载容器 `GTM-MLXXG558`，无需设置环境变量。GA4、单页导航的页面浏览事件及同意规则均在 GTM 容器内配置；网站代码不额外发送页面浏览或转化事件。

应用不会在本地开发或 Vercel Preview 中加载这些统计脚本；手动集成的 Cloudflare 脚本在页面加载后的空闲时段启动。如需排除特定地区或接入同意机制，请在上线前按站点的隐私要求配置。

## 使用文档

`/zh/docs` 和 `/en/docs` 使用 Fumadocs 渲染，共享网站的语言和主题。文档内切换文章不播放全屏转场。文档内容在 `content/docs/`：

- `index.mdx` 是中文首页，`index.en.mdx` 是对应的英文版。
- 新增主题时，使用相同的 slug 创建 `主题.mdx` 和 `主题.en.mdx`，在 frontmatter 中写 `title` 和 `description`，并在 `meta.json` 设置导航顺序。
- 正文的二级、三级标题会生成页内目录。运行 `bun run dev` 预览；`bun run build` 会重新生成内容索引并检查页面。

## 网站更新日志

`/zh/changelog` 和 `/en/changelog` 展示官网更新，不是客户端发行记录。新增条目时在 `app/[lang]/changelog/entries.ts` 补充日期、唯一 ID、中英文标题与说明，最新条目放在最前面。

## 搜索索引与分享卡片

| 可索引栏目 | 中文 | English |
| --- | --- | --- |
| 产品首页 | `/zh` | `/en` |
| Windows 版下载 | `/zh/download` | `/en/download` |
| Windows 版开源协议 | `/zh/license` | `/en/license` |
| 网站更新日志 | `/zh/changelog` | `/en/changelog` |
| 快速开始 | `/zh/docs` | `/en/docs` |
| 下载与安装 | `/zh/docs/installation` | `/en/docs/installation` |

`/sitemap.xml` 根据当前文档内容自动更新，仅列出正式页面。已翻译的页面在 HTML 与 sitemap 中互相声明语言版本；设计预览允许抓取但设置 `noindex`。部署后检查 sitemap 及其中的 URL 可直接访问，再在 Search Console 提交 `/sitemap.xml`。

首页、下载、协议和文档各有中英文 1200 × 630 PNG 分享图，位于 `public/brand/og/`。使用 `bun scripts/render-og.mjs` 重新生成（需 Chrome/Chromium，可通过 `CHROME_BIN` 指定）。图稿发布后若需更新，修改 `lib/site-metadata.ts` 中的图片版本后重新生成，让分享平台看到新 URL。上线后用分享平台的预览工具检查真实域名并刷新平台缓存。

## 旧版迁移

`main` 用于发布新版，`old` 保存上线前的旧站源码。旧版 `/zh/guide` 和 `/en/guide` 分别永久跳转至对应语言的文档页，旧版 `/about` 地址跳转至对应语言的官网首页。
