import { loader } from 'fumadocs-core/source';
import { docs } from '@/.source/server';

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n: { defaultLanguage: 'zh', languages: ['zh', 'en'], fallbackLanguage: null },
});
