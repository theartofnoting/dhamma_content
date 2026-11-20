import { GITHUB_CONFIG } from '../config/siteConfig';
import { DiscourseMediaType } from '../types/dhamma';

export function resolveAssetUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }
  const base = import.meta.env.BASE_URL || '/';
  if (trimmed.startsWith(base) && base !== '/') {
    return trimmed;
  }
  const cleaned = trimmed.replace(/^\/+/, '').replace(/^public\//i, '');
  if (cleaned.startsWith('media/')) {
    return `${base}content/${cleaned}`;
  }
  return `${base}${cleaned}`;
}

export function extractYouTubeId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
      if (match && match[1]) return match[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveMediaSource(
  rawUrl: string,
  explicitType?: DiscourseMediaType,
): {
  kind: 'youtube' | 'audio' | 'video' | 'image' | 'link';
  src: string;
  embedSrc?: string;
} {
  const trimmed = rawUrl.trim();
  const src = resolveAssetUrl(trimmed);
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      kind: 'youtube',
      src,
      embedSrc: `https://www.youtube-nocookie.com/embed/${ytId}`,
    };
  }

  const lower = trimmed.toLowerCase().split('?')[0];
  if (
    explicitType === 'audio' ||
    lower.startsWith('data:audio/') ||
    /\.(mp3|m4a|wav|ogg|aac|opus|flac)$/i.test(lower)
  ) {
    return { kind: 'audio', src };
  }
  if (
    explicitType === 'video' ||
    lower.startsWith('data:video/') ||
    /\.(mp4|webm|mov|m4v|ogv)$/i.test(lower)
  ) {
    return { kind: 'video', src };
  }
  if (
    explicitType === 'image' ||
    lower.startsWith('data:image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(lower)
  ) {
    return { kind: 'image', src };
  }
  return { kind: 'link', src };
}

export function normalizeGoogleFormUrl(input: string): {
  ok: boolean;
  embedUrl?: string;
  error?: string;
} {
  let raw = input.trim();
  if (!raw) {
    return { ok: true, embedUrl: '' };
  }

  const srcMatch = raw.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    raw = srcMatch[1].trim();
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return {
      ok: false,
      error: 'Please enter a valid URL starting with https://docs.google.com/forms/...',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      ok: false,
      error: 'Only HTTPS Google Form URLs are supported.',
    };
  }

  if (parsed.hostname === 'forms.gle') {
    return {
      ok: false,
      error:
        'Shortened forms.gle links cannot be embedded directly in an iframe. Open the link in a browser tab and copy the full https://docs.google.com/forms/d/e/.../viewform address.',
    };
  }

  if (!parsed.hostname.includes('docs.google.com') || !parsed.pathname.includes('/forms')) {
    return {
      ok: false,
      error: 'URL must point to Google Forms (https://docs.google.com/forms/...).',
    };
  }

  if (parsed.pathname.endsWith('/edit')) {
    parsed.pathname = parsed.pathname.replace(/\/edit$/, '/viewform');
  }

  parsed.searchParams.set('embedded', 'true');
  return { ok: true, embedUrl: parsed.toString() };
}

export function getMediaPrefix(): string {
  return `${GITHUB_CONFIG.mediaRoot}/`;
}
