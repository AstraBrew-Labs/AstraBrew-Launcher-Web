import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
  formatSiteTitle, languageAlternates, launcherStructuredData, localizedMetadata, shareImagePath,
  siteMetadata, siteOrigin, sitePagePaths, sitePages,
} from '../lib/site-metadata.ts';

const origin = 'https://launcher.example.com';
const envKeys = ['NEXT_PUBLIC_SITE_URL', 'NODE_ENV', 'PORT', 'VERCEL_ENV'];
let original;

beforeEach(() => {
  original = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  process.env.NEXT_PUBLIC_SITE_URL = origin;
  process.env.NODE_ENV = 'production';
  delete process.env.VERCEL_ENV;
});

afterEach(() => {
  for (const key of envKeys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe('site SEO', () => {
  test('restored homepage titles do not change the titles of other pages', () => {
    const titles = {
      zh: { home: '星酿启动器 (AstraBrew Launcher) · 简单易用的 SillyTavern 酒馆启动器', suffix: '星酿启动器｜SillyTavern 酒馆启动与管理工具', download: 'Windows 版下载', license: 'Apache 2.0 开源协议', about: '关于我们', changelog: '更新日志' },
      en: { home: 'AstraBrew Launcher (星酿启动器) · A simpler way to run SillyTavern', suffix: 'AstraBrew Launcher — SillyTavern Launcher', download: 'Download for Windows', license: 'Apache 2.0 License', about: 'About AstraBrew Labs', changelog: 'Website Changelog' },
    };
    for (const [locale, labels] of Object.entries(titles)) {
      for (const page of sitePages) {
        const metadata = siteMetadata(locale, page);
        const expected = page === 'home' ? labels.home : `${labels[page]} | ${labels.suffix}`;
        expect(metadata.title).toBe(expected);
        expect(metadata.openGraph.title).toBe(expected);
        expect(metadata.twitter.title).toBe(expected);
      }
      const preview = locale === 'zh' ? '设计预览' : 'Design preview';
      expect(formatSiteTitle(locale, preview)).toBe(`${preview} | ${labels.suffix}`);
    }
  });

  test('home descriptions distinguish available and unreleased editions', () => {
    const zh = siteMetadata('zh', 'home');
    const en = siteMetadata('en', 'home');
    expect(zh.description).toContain('Windows 版现已发布，macOS 版尚未发布');
    expect(en.description).toContain('The Windows edition is available now. The macOS edition has not yet been released.');
    for (const metadata of [zh, en]) {
      expect(metadata.openGraph.description).toBe(metadata.description);
      expect(metadata.twitter.description).toBe(metadata.description);
    }
  });

  test('canonical, mutual alternates, and OG URLs agree for each public section', () => {
    expect(sitePagePaths('home')).toEqual({ zh: '/zh', en: '/en' });
    for (const page of sitePages) {
      const paths = sitePagePaths(page);
      const en = siteMetadata('en', page);
      const zh = siteMetadata('zh', page);
      expect(en.alternates.languages).toEqual({ zh: origin + paths.zh, en: origin + paths.en, 'x-default': origin + paths.en });
      expect(zh.alternates.languages).toEqual(en.alternates.languages);
      for (const [locale, metadata] of [['zh', zh], ['en', en]]) {
        expect(metadata.alternates.canonical).toBe(origin + paths[locale]);
        expect(metadata.openGraph.url).toBe(metadata.alternates.canonical);
        expect(metadata.openGraph.images[0].url).toBe(origin + shareImagePath(page, locale));
        expect(metadata.twitter.card).toBe('summary_large_image');
        expect(metadata.twitter.images[0].url).toBe(metadata.openGraph.images[0].url);
      }
    }
    expect(siteMetadata('en', 'license').description).not.toBe(siteMetadata('en', 'home').description);
  });

  test('an untranslated guide has a canonical but no alternate targeting a fallback or 404', () => {
    const meta = localizedMetadata({
      locale: 'zh', section: 'docs', paths: { zh: '/zh/docs/topic' }, title: 'Topic', description: 'A help topic.',
    });
    expect(meta.title).toBe('Topic | 星酿启动器｜SillyTavern 酒馆启动与管理工具');
    expect(meta.openGraph.title).toBe(meta.title);
    expect(meta.twitter.title).toBe(meta.title);
    expect(meta.alternates.canonical).toBe(`${origin}/zh/docs/topic`);
    expect(meta.alternates.languages).toBeUndefined();
    expect(meta.openGraph.alternateLocale).toEqual([]);
    expect(languageAlternates({ en: `${origin}/en/docs/topic` })).toBeUndefined();
  });

  test('unconfigured and invalid origins cannot leak fallback domains into metadata', () => {
    for (const value of ['', 'not-a-url', 'http://launcher.example.com', 'https://username@launcher.example.com', 'https://localhost:3000', 'http://127.0.0.1:3000']) {
      process.env.NEXT_PUBLIC_SITE_URL = value;
      expect(siteOrigin()).toBeNull();
      const meta = siteMetadata('en', 'home');
      expect(meta.alternates).toBeUndefined();
      expect(meta.openGraph.url).toBeUndefined();
      expect(meta.openGraph.images).toBeUndefined();
      expect(launcherStructuredData('en')).toBeNull();
    }
  });

  test('only Vercel production defaults to the official domain', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = 'preview';
    expect(siteOrigin()).toBeNull();
    process.env.VERCEL_ENV = 'production';
    expect(siteMetadata('en', 'home').alternates.canonical).toBe('https://launcher.astrabrew.cn/en');
    process.env.NEXT_PUBLIC_SITE_URL = origin;
    expect(siteOrigin()).toBe(origin);
  });

  test('local audits get self-referencing metadata with the actual dev port', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.PORT;
    expect(siteOrigin()).toBe('http://localhost:3000');
    process.env.PORT = '4321';
    const meta = siteMetadata('zh', 'home');
    expect(meta.alternates.canonical).toBe('http://localhost:4321/zh');
    expect(meta.openGraph.images[0].url).toBe(`http://localhost:4321${shareImagePath('home', 'zh')}`);
    expect(meta.twitter.card).toBe('summary_large_image');
    process.env.NEXT_PUBLIC_SITE_URL = 'https://127.0.0.1:4321';
    expect(siteOrigin()).toBe('https://127.0.0.1:4321');
    process.env.NEXT_PUBLIC_SITE_URL = 'http://launcher.example.com';
    expect(siteOrigin()).toBeNull();
  });

  test('software structured data describes the published Windows edition', () => {
    const zh = launcherStructuredData('zh');
    expect(zh['@type']).toBe('SoftwareApplication');
    expect(zh.operatingSystem).toBe('Windows');
    expect(zh.url).toBe(`${origin}/zh`);
    expect(zh.installUrl).toBe(`${origin}/zh/download`);
    expect(zh['@id']).toBe(launcherStructuredData('en')['@id']);
  });

  test('all share card assets are 1200 × 630 PNGs', () => {
    for (const section of [...sitePages, 'docs']) {
      for (const locale of ['zh', 'en']) {
        const png = readFileSync(new URL(`../public${shareImagePath(section, locale)}`, import.meta.url));
        expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
        expect(png.readUInt32BE(16)).toBe(1200);
        expect(png.readUInt32BE(20)).toBe(630);
      }
    }
  });
});
