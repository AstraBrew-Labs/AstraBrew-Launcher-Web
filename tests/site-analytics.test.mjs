import { expect, test } from 'bun:test';
import { runInNewContext } from 'node:vm';
import { SiteAnalytics } from '../components/site/site-analytics.tsx';

function renderAnalytics(nodeEnv, vercelEnv) {
  const previous = { NODE_ENV: process.env.NODE_ENV, VERCEL_ENV: process.env.VERCEL_ENV };
  try {
    process.env.NODE_ENV = nodeEnv;
    if (vercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = vercelEnv;
    return SiteAnalytics();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('GTM is enabled in production but excluded from development and Vercel Preview', () => {
  expect(renderAnalytics('development')).toBeNull();
  expect(renderAnalytics('production', 'preview')).toBeNull();
  for (const vercelEnv of [undefined, 'production']) {
    const children = renderAnalytics('production', vercelEnv).props.children;
    const gtm = children.find((child) => child?.props?.id === 'google-tag-manager-bootstrap');
    expect(gtm.props.strategy).toBe('afterInteractive');
  }
});

test('GTM queues bootstrap events before inserting its async script, once per document', () => {
  const gtm = renderAnalytics('production', 'production').props.children
    .find((child) => child?.props?.id === 'google-tag-manager-bootstrap');
  const layer = [{ event: 'existing' }];
  const inserted = [];
  const document = {
    getElementById: (id) => inserted.find((script) => script.id === id),
    createElement: (tag) => ({ tag }),
    head: {
      appendChild(script) {
        expect(Array.from(layer[1])[0]).toBe('js');
        expect(layer[2]).toEqual({ 'gtm.start': layer[1][1].getTime(), event: 'gtm.js' });
        inserted.push(script);
      },
    },
  };
  const window = { dataLayer: layer };
  const context = { document, window };
  runInNewContext(gtm.props.children, context);
  runInNewContext(gtm.props.children, context);
  expect(window.dataLayer).toBe(layer);
  expect(layer).toHaveLength(3);
  expect(inserted).toEqual([{
    tag: 'script', id: 'google-tag-manager-container', async: true,
    src: 'https://www.googletagmanager.com/gtm.js?id=GTM-MLXXG558',
  }]);
});
