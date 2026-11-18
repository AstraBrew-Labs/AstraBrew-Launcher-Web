import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { notFound } from 'next/navigation';
import { DocsMotionReady } from '@/components/site/page-motion';
import { docsSource } from '@/lib/docs';
import { docsPagePaths } from '@/lib/docs-seo';
import { isLocale } from '@/lib/i18n';
import { localizedMetadata } from '@/lib/site-metadata';

type Props = PageProps<'/[lang]/docs/[[...slug]]'>;
export function generateStaticParams({ params }: { params: { lang: string } }) {
  return docsSource.getPages(params.lang).map(page => ({ slug: page.slugs }));
}

async function resolvePage(params: Props['params']) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const page = docsSource.getPage(slug, lang);
  if (!page) notFound();
  return { page, lang };
}

export async function generateMetadata({ params }: Props) {
  const { page, lang } = await resolvePage(params);
  return localizedMetadata({
    locale: lang,
    paths: docsPagePaths(page.slugs),
    section: 'docs',
    title: `${page.data.title} | ${lang === 'zh' ? '星酿启动器使用文档' : 'AstraBrew Launcher User Guide'}`,
    description: page.data.description ?? page.data.title,
  });
}

export default async function GuidePage({ params }: Props) {
  const { page } = await resolvePage(params);
  const Content = page.data.body;
  return <DocsPage toc={page.data.toc} data-transit-path={page.url}>
    <DocsTitle id="main-content">{page.data.title}</DocsTitle>
    <DocsDescription data-docs-description>{page.data.description}</DocsDescription>
    <DocsBody data-docs-body><Content components={defaultMdxComponents} /></DocsBody>
    <DocsMotionReady />
  </DocsPage>;
}
