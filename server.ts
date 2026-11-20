import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SUPPORTED_LOCALES = ['vi', 'en', 'my'] as const;
type ServerLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: ServerLocale = 'vi';

const LOCALE_HTML_META: Record<ServerLocale, { title: string; description: string }> = {
  vi: {
    title: 'Vipassana Bhavana — ',
    description:
      'Trang sổ tay lưu trữ Pháp Thoại và Hưởng Dẫn Thực Hành của các Thiền Sư.',
  },
  en: {
    title: 'Vipassana Bhavana — Dhamma Page & Sayadaw Teachings',
    description:
      'Vipassana Bhavana Dhamma Page — preserving Sayadaw discourses, meditation tips, group meditation courses, and submission forms.',
  },
  my: {
    title: 'Vipassana Bhavana — ဓမ္မစာမျက်နှာနှင့် ဆရာတော်များ၏ တရားတော်များ',
    description:
      'Vipassana Bhavana အဖွဲ့၏ ဆရာတော်များ ဟောကြားတော်မူသော တရားတော်များ၊ တရားရှုမှတ်နည်း လမ်းညွှန်များနှင့် တရားစခန်း စာရင်းသွင်းရာ စာမျက်နှာ။',
  },
};

function resolveLocaleFromPath(pathname: string): ServerLocale {
  const firstSegment = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (firstSegment === 'en' || firstSegment === 'my' || firstSegment === 'vi') {
    return firstSegment;
  }
  return DEFAULT_LOCALE;
}

function injectLocaleMetadata(html: string, locale: ServerLocale): string {
  const meta = LOCALE_HTML_META[locale];
  return html
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${locale}"`)
    .replace(/<title>[^<]*<\/title>/i, `<title>${meta.title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"/i,
      `<meta name="description" content="${meta.description}"`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"/i,
      `<meta property="og:title" content="${meta.title}"`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"/i,
      `<meta property="og:description" content="${meta.description}"`,
    );
}

function isSpaDocumentRequest(req: Request): boolean {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  const pathname = req.path;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/content/') ||
    pathname.startsWith('/src/') ||
    pathname.startsWith('/@') ||
    pathname.startsWith('/node_modules/')
  ) {
    return false;
  }
  const hasFileExtension = path.extname(pathname) !== '';
  if (hasFileExtension && pathname !== '/index.html') {
    return false;
  }
  const accept = req.headers.accept || '';
  return accept.includes('text/html') || accept === '*/*' || !accept;
}

async function createServer() {
  const app = express();
  app.set('trust proxy', true);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      defaultLocale: DEFAULT_LOCALE,
      supportedLocales: SUPPORTED_LOCALES,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(async (req: Request, res: Response, next) => {
      if (!isSpaDocumentRequest(req)) {
        return next();
      }
      try {
        const locale = resolveLocaleFromPath(req.path);
        const templatePath = path.resolve(__dirname, 'index.html');
        const rawTemplate = fs.readFileSync(templatePath, 'utf-8');
        const transformed = await vite.transformIndexHtml(
          req.originalUrl,
          injectLocaleMetadata(rawTemplate, locale),
        );
        res
          .status(200)
          .set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
          .end(transformed);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        res.status(500).end((err as Error).message);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const distIndexPath = path.join(distDir, 'index.html');

    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir, { index: false }));
      app.get('*', (req: Request, res: Response) => {
        const locale = resolveLocaleFromPath(req.path);
        if (!fs.existsSync(distIndexPath)) {
          res.status(404).send('Build output not found.');
          return;
        }
        const rawHtml = fs.readFileSync(distIndexPath, 'utf-8');
        res
          .status(200)
          .set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
          .send(injectLocaleMetadata(rawHtml, locale));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vipassana Bhavana server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
