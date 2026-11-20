import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

const MIME_TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.rst': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

function unifiedContentPlugin(basePath: string): Plugin {
  const contentRoot = path.resolve(__dirname, 'content');
  const normalizedBase = basePath.replace(/\/+$/, '');

  return {
    name: 'unified-content-directory',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = (req.url || '').split('?')[0];
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
        res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-store');
        fs.createReadStream(target).pipe(res);
      });
    },
    closeBundle(error?: Error) {
      if (error) return;
      const distDir = path.resolve(__dirname, 'dist');
      const distContent = path.resolve(distDir, 'content');
      if (fs.existsSync(distDir) && fs.existsSync(contentRoot)) {
        fs.cpSync(contentRoot, distContent, {recursive: true, force: true});
      }
    },
  };
}

export default defineConfig(() => {
  const basePath = process.env.VITE_BASE_PATH || '/';
  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      unifiedContentPlugin(basePath),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." still resolve in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
