import { expect, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { updates } from '../app/[lang]/changelog/entries.ts';
import { sitePagePaths, sitePages } from '../lib/site-metadata.ts';
import { proxy } from '../proxy.ts';

test('changelog entries are newest first with unique stable IDs and bilingual copy', () => {
  expect(updates.length).toBeGreaterThan(1);
  expect(updates.map(({ date }) => date)).toEqual(updates.map(({ date }) => date).sort().reverse());
  expect(new Set(updates.map(({ id }) => id)).size).toBe(updates.length);
  for (const { id, date, title, notes } of updates) {
    expect(id).toMatch(/^[a-z][a-z0-9-]+$/);
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(date);
    expect(notes.length).toBeGreaterThan(0);
    for (const copy of [title, ...notes]) {
      expect(copy.zh.trim()).not.toBe('');
      expect(copy.en.trim()).not.toBe('');
    }
  }
});

test('changelog entry redirects by locale and has indexable localized paths', () => {
  expect(sitePages).toContain('changelog');
  expect(sitePagePaths('changelog')).toEqual({ zh: '/zh/changelog', en: '/en/changelog' });
  const response = proxy(new NextRequest('https://example.com/changelog', { headers: { 'accept-language': 'zh-CN' } }));
  expect(response.status).toBe(307);
  expect(response.headers.get('location')).toBe('https://example.com/zh/changelog');
});
