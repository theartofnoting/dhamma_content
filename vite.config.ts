import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig, Plugin } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const CONTENT_MIME_TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.rst': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

function unifiedContentPlugin(basePath: string): Plugin {
  const contentRoot = path.resolve(projectRoot, 'content');
  const normalizedBase = basePath.replace(/\/+$/, '');

  return {
    name: 'unified-content-directory',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [rawUrl, rawQuery = ''] = (req.url || '').split('?');
        const queryParams = new URLSearchParams(rawQuery);
        if (
          queryParams.has('import') ||
          queryParams.has('raw') ||
          queryParams.has('url') ||
          queryParams.has('inline') ||
          queryParams.has('worker')
        ) {
          return next();
        }

        let rel = rawUrl;
        if (normalizedBase && rel.startsWith(normalizedBase)) {
          rel = rel.slice(normalizedBase.length);
        }
        if (!rel.startsWith('/content/')) {
          return next();
        }

        const subPath = decodeURIComponent(rel.slice('/content/'.length));
        const target = path.resolve(contentRoot, subPath);
        if (!target.startsWith(contentRoot) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
          return next();
        }

        const ext = path.extname(target).toLowerCase();
        res.setHeader('Content-Type', CONTENT_MIME_TYPES[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-store');
        fs.createReadStream(target).pipe(res);
      });
    },
    closeBundle(error?: Error) {
      if (error) return;
      const distDir = path.resolve(projectRoot, 'dist');
      const distContent = path.resolve(distDir, 'content');
      if (fs.existsSync(distDir) && fs.existsSync(contentRoot)) {
        fs.cpSync(contentRoot, distContent, { recursive: true, force: true });
      }
    },
  };
}

const STATIC_LOCALE_META = {
  vi: {
    title: 'Vipassana Bhavana — Pháp Thoại, Thực Hành &amp; Khóa Thiền',
    description:
      'Sổ tay học Pháp của nhóm Vipassana Bhavana: lưu lại Pháp thoại từ các vị Thiền sư (Sayadaw), kinh nghiệm thực hành và lịch khóa thiền.',
  },
  en: {
    title: 'Vipassana Bhavana — Dhamma Page &amp; Sayadaw Teachings',
    description:
      'Vipassana Bhavana Dhamma Page — group study notebook preserving Sayadaw discourses, meditation practice notes, shared retreat calendars, and online forms.',
  },
  my: {
    title: 'Vipassana Bhavana — ဓမ္မစာမျက်နှာနှင့် ဆရာတော်များ၏ တရားတော်များ',
    description:
      'Vipassana Bhavana အဖွဲ့၏ ဆရာတော်များ ဟောကြားတော်မူသော တရားတော်များ၊ တရားရှုမှတ်နည်း လမ်းညွှန်များနှင့် တရားစခန်း စာရင်းသွင်းရာ စာမျက်နှာ။',
  },
} as const;

function writeLocalizedHtmlEntrypoints(distDir: string) {
  const indexHtmlPath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) return;
  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  fs.writeFileSync(path.resolve(distDir, '404.html'), baseHtml, 'utf-8');

  for (const [locale, meta] of Object.entries(STATIC_LOCALE_META)) {
    const localizedHtml = baseHtml
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

    const localeDir = path.resolve(distDir, locale);
    fs.mkdirSync(localeDir, { recursive: true });
    fs.writeFileSync(path.resolve(localeDir, 'index.html'), localizedHtml, 'utf-8');
  }
}

export default defineConfig(() => {
  const basePath = process.env.VITE_BASE_PATH || '/';

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      unifiedContentPlugin(basePath),
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) return;
          const distDir = path.resolve(projectRoot, 'dist');
          const srcAssets = path.resolve(projectRoot, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
          writeLocalizedHtmlEntrypoints(distDir);
        },
      },
    ],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-react',
                test: /node_modules[\\/](react|react-dom|scheduler)/,
                priority: 20,
              },
              {
                name: 'vendor-icons',
                test: /node_modules[\\/]lucide-react/,
                priority: 15,
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
