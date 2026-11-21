import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BootLogo } from '../components/site/boot-logo.tsx';
import { launcherLockup, launcherLockupSize } from '../lib/launcher-brand.ts';

const paths = svg => [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(([, d]) => d);

// The animated copy must still overlay the header logo exactly on its last frame.
for (const [locale, glyphCount] of [['zh', 5], ['en', 17]]) {
  test(`the ${locale} opening SVG preserves the corresponding header lockup geometry`, () => {
    const { src, name } = launcherLockup[locale];
    const asset = readFileSync(new URL(`../public${src}`, import.meta.url), 'utf8');
    const markup = renderToStaticMarkup(createElement(BootLogo, { locale }));
    const [chevron, star, ...glyphs] = paths(markup);
    expect(glyphs).toHaveLength(glyphCount);
    expect([chevron, star, glyphs.join('')]).toEqual(paths(asset));
    expect(asset).toContain(`>${name}</title>`);
    const viewBox = `viewBox="0 0 ${launcherLockupSize.width} ${launcherLockupSize.height}"`;
    expect(asset).toContain(viewBox);
    expect(markup).toContain(viewBox);
    expect([...markup.matchAll(/pathLength="1"/g)]).toHaveLength(2 + glyphCount);
  });
}
