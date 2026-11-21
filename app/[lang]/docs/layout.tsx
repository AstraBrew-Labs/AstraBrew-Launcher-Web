import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { docsSource } from '@/lib/docs';
import { isLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { BackToTop } from '@/components/site/back-to-top';
import { PageMotion } from '@/components/site/page-motion';
import './docs.css';

export default async function UserGuideLayout({ children, params }: LayoutProps<'/[lang]/docs'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const title = lang === 'zh' ? '使用文档' : 'User guide';
  return <RootProvider theme={{ enabled: false }} search={{ enabled: false }} i18n={{ locale: lang, translations: lang === 'zh' ? {
    'On this page(table of contents)': '本页目录', 'Next Page(pagination)': '下一篇', 'Previous Page(pagination)': '上一篇',
    'Open Sidebar(sidebar)(aria-label)': '打开文档导航', 'Close Sidebar(sidebar)(aria-label)': '关闭文档导航',
    'Collapse Sidebar(sidebar)(aria-label)': '收起文档导航', 'Toggle Menu(mobile menu)(aria-label)': '切换文档菜单',
    'Copy Anchor Link(heading anchor)(aria-label)': '复制章节链接', 'Skip to Content(skip link)': '跳至正文',
  } : undefined }}>
    <DocsLayout tree={docsSource.getPageTree(lang)} nav={{ title, url: `/${lang}/docs` }} themeSwitch={{ enabled: false }} searchToggle={{ enabled: false }}>
      <PageMotion page="docs" />
      {children}
    </DocsLayout>
    <BackToTop locale={lang} />
  </RootProvider>;
}
