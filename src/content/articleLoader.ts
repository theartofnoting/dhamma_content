import { TAXONOMY } from '../config/siteConfig';
import { calculateEstimatedReadingMinutes } from '../tools/readingTime';
import {
  getCollectionSlug,
  getDiscourseSlug,
  getSayadawSlug,
  slugifySegment,
} from '../tools/slugify';
import {
  DhammaDiscourse,
  DiscourseLanguage,
  DiscourseMediaItem,
  DiscourseSection,
  SayadawProfile,
  TraditionCollection,
} from '../types/dhamma';

const rawArticleModules = import.meta.glob('/content/articles/**/*.{md,rst}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function resolveCollection(raw?: string): TraditionCollection {
  if (!raw) return 'Satipatthana & Vipassana';
  const lower = raw.toLowerCase();
  const exact = TAXONOMY.collections.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;
  if (lower.includes('abhidhamma') || lower.includes('patthana')) return 'Abhidhamma';
  if (lower.includes('sutta') || lower.includes('nikaya')) return 'Sutta Pitaka';
  if (lower.includes('visuddhimagga')) return 'Visuddhimagga';
  if (lower.includes('monastic') || lower.includes('talk')) return 'Monastic Talks';
  return 'Satipatthana & Vipassana';
}

function resolveLanguage(raw?: string): DiscourseLanguage {
  if (!raw) return 'Pāli · English';
  if (raw.includes('繁體中文') && raw.includes('English')) return 'Pāli · 繁體中文 · English';
  if (raw.includes('繁體中文')) return '繁體中文';
  if (raw === 'English') return 'English';
  return 'Pāli · English';
}

function inferPathSegments(filePath: string): {
  collectionSlug: string;
  sayadawSlug: string;
  fileSlug: string;
  format: 'md' | 'rst';
} {
  const clean = filePath.replace(/^\/+/, '');
  const parts = clean.split('/').filter(Boolean);
  const filename = parts[parts.length - 1] || 'discourse.md';
  const format: 'md' | 'rst' = filename.toLowerCase().endsWith('.rst') ? 'rst' : 'md';
  const fileSlug = filename.replace(/\.(md|rst)$/i, '');

  const withoutContent = parts[0] === 'content' ? parts.slice(1) : parts;
  const withoutPrefix = withoutContent[0] === 'articles' ? withoutContent.slice(1) : withoutContent;
  if (withoutPrefix.length >= 3) {
    return {
      collectionSlug: slugifySegment(withoutPrefix[0]),
      sayadawSlug: slugifySegment(withoutPrefix[1]),
      fileSlug,
      format,
    };
  }
  if (withoutPrefix.length === 2) {
    return {
      collectionSlug: 'dhamma-archive',
      sayadawSlug: slugifySegment(withoutPrefix[0]),
      fileSlug,
      format,
    };
  }
  return {
    collectionSlug: 'dhamma-archive',
    sayadawSlug: 'sayadaw-archive',
    fileSlug,
    format,
  };
}

function matchSayadawBySlugOrName(
  slugOrId: string | undefined,
  name: string | undefined,
  sayadaws: SayadawProfile[],
): { sayadawId: string; sayadawName: string } {
  const targetSlug = (slugOrId || '').toLowerCase();
  const targetName = (name || '').toLowerCase();
  const found = sayadaws.find(
    (s) =>
      (s.slug && s.slug.toLowerCase() === targetSlug) ||
      s.id.toLowerCase() === targetSlug ||
      (targetName && s.name.toLowerCase() === targetName),
  );
  if (found) {
    return { sayadawId: found.id, sayadawName: found.name };
  }
  const cleanName = name?.trim() || slugOrId?.replace(/-/g, ' ') || 'Group Sayadaw';
  return {
    sayadawId: slugOrId ? slugifySegment(slugOrId) : slugifySegment(cleanName),
    sayadawName: cleanName,
  };
}

function parseMarkdownArticle(
  filePath: string,
  raw: string,
  sayadaws: SayadawProfile[],
  index: number,
): DhammaDiscourse {
  const pathMeta = inferPathSegments(filePath);
  const meta: Record<string, string> = {};
  let body = raw;

  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (fmMatch) {
    const fmLines = fmMatch[1].split(/\r?\n/);
    for (const line of fmLines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        const val = line
          .slice(colonIdx + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
        if (val) meta[key] = val;
      }
    }
    body = fmMatch[2];
  }

  const lines = body.split(/\r?\n/);
  let title = meta.title || '';
  const sections: DiscourseSection[] = [];
  let currentHeading = '1. Discourse Exposition';
  let currentParagraphs: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!title && line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '');
      continue;
    }
    if (line.startsWith('## ')) {
      if (currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading, paragraphs: currentParagraphs });
      }
      currentHeading = line.replace(/^##\s+/, '');
      currentParagraphs = [];
    } else if (line && !line.startsWith('>')) {
      currentParagraphs.push(line);
    }
  }

  if (currentParagraphs.length > 0 || sections.length === 0) {
    sections.push({
      heading: currentHeading,
      paragraphs:
        currentParagraphs.length > 0 ? currentParagraphs : ['Recorded Dhamma discourse.'],
    });
  }

  const sayadawInfo = matchSayadawBySlugOrName(
    meta.sayadaw_slug || pathMeta.sayadawSlug,
    meta.sayadaw,
    sayadaws,
  );
  const collection = resolveCollection(meta.collection || pathMeta.collectionSlug);
  const discourseSlug = meta.slug || pathMeta.fileSlug;
  const collectionSlug = meta.collection_slug || pathMeta.collectionSlug;

  const draft: DhammaDiscourse = {
    id: `article-${sayadawInfo.sayadawId}-${discourseSlug}`,
    accessionCode: meta.accession || `ART. ${String(index + 1).padStart(2, '0')}`,
    slug: discourseSlug,
    collectionSlug,
    sourceFormat: 'md',
    title: title || discourseSlug.replace(/-/g, ' '),
    chineseTitle: meta.chinese_title || undefined,
    paliSubtitle: meta.pali_subtitle || undefined,
    sayadawId: sayadawInfo.sayadawId,
    sayadawName: sayadawInfo.sayadawName,
    collection,
    language: resolveLanguage(meta.language),
    dateRecorded: meta.date || meta.date_recorded || 'Archive Article',
    readingMinutes: 5,
    sourceText: meta.source || meta.source_text || 'Archive Article',
    summary: meta.summary || sections[0]?.paragraphs[0]?.slice(0, 220) || title,
    sections,
    pullQuote:
      meta.pull_quote ||
      sections[0]?.paragraphs[0]?.slice(0, 160) ||
      'Observe phenomena as they arise and pass away.',
    marginNotes: [],
    footnotes: meta.source ? [{ index: 1, text: meta.source }] : [],
    coverImage: meta.cover_image || undefined,
    audioReferenceUrl: meta.audio || meta.audio_reference || undefined,
    repoPath: filePath.replace(/^\/+/, ''),
  };

  draft.readingMinutes = calculateEstimatedReadingMinutes(draft);
  return draft;
}

function parseRstArticle(
  filePath: string,
  raw: string,
  sayadaws: SayadawProfile[],
  index: number,
): DhammaDiscourse {
  const pathMeta = inferPathSegments(filePath);
  const lines = raw.split(/\r?\n/);
  const meta: Record<string, string> = {};
  const mediaItems: DiscourseMediaItem[] = [];

  let title = '';
  const bodyLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextTrimmed = (lines[i + 1] || '').trim();

    if (
      /^[=\-*~^]{4,}$/.test(trimmed) &&
      i + 2 < lines.length &&
      /^[=\-*~^]{4,}$/.test((lines[i + 2] || '').trim())
    ) {
      const candidate = (lines[i + 1] || '').trim();
      if (!title && candidate) {
        title = candidate;
        i += 2;
        continue;
      }
    }

    if (trimmed && /^[=\-~^]{4,}$/.test(nextTrimmed)) {
      if (!title && (nextTrimmed.startsWith('=') || nextTrimmed.startsWith('*'))) {
        title = trimmed;
        i += 1;
        continue;
      }
      bodyLines.push(`## ${trimmed}`);
      i += 1;
      continue;
    }

    const fieldMatch = trimmed.match(/^:([a-zA-Z0-9_]+):\s*(.+)$/);
    if (fieldMatch) {
      meta[fieldMatch[1].toLowerCase()] = fieldMatch[2].trim();
      continue;
    }

    const dirMatch = trimmed.match(/^\.\.\s+(image|figure|audio|video)::\s*(.+)$/i);
    if (dirMatch) {
      const dirType = dirMatch[1].toLowerCase();
      const targetUrl = dirMatch[2].trim();
      if (dirType === 'image' || dirType === 'figure') {
        if (!meta.cover_image) {
          meta.cover_image = targetUrl;
        } else {
          mediaItems.push({
            id: `rst-media-${i}`,
            type: 'image',
            title: `Figure ${mediaItems.length + 1}`,
            url: targetUrl,
          });
        }
      } else {
        mediaItems.push({
          id: `rst-media-${i}`,
          type: dirType === 'audio' ? 'audio' : 'video',
          title: `${dirType.toUpperCase()} Recording`,
          url: targetUrl,
        });
      }
      continue;
    }

    if (trimmed.startsWith('.. ')) continue;

    bodyLines.push(line);
  }

  const sections: DiscourseSection[] = [];
  let currentHeading = '1. Discourse Text';
  let currentParagraphs: string[] = [];
  let paraBuf: string[] = [];

  const flushParagraph = () => {
    if (paraBuf.length > 0) {
      currentParagraphs.push(paraBuf.join(' ').trim());
      paraBuf = [];
    }
  };

  for (const bLine of bodyLines) {
    const t = bLine.trim();
    if (t.startsWith('## ')) {
      flushParagraph();
      if (currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading, paragraphs: currentParagraphs });
      }
      currentHeading = t.replace(/^##\s+/, '');
      currentParagraphs = [];
    } else if (!t) {
      flushParagraph();
    } else {
      paraBuf.push(t);
    }
  }
  flushParagraph();
  if (currentParagraphs.length > 0 || sections.length === 0) {
    sections.push({
      heading: currentHeading,
      paragraphs:
        currentParagraphs.length > 0 ? currentParagraphs : ['Recorded Dhamma discourse.'],
    });
  }

  const sayadawInfo = matchSayadawBySlugOrName(
    meta.sayadaw_slug || pathMeta.sayadawSlug,
    meta.sayadaw,
    sayadaws,
  );
  const collection = resolveCollection(meta.collection || pathMeta.collectionSlug);
  const discourseSlug = meta.slug || pathMeta.fileSlug;
  const collectionSlug = meta.collection_slug || pathMeta.collectionSlug;

  const draft: DhammaDiscourse = {
    id: `rst-${sayadawInfo.sayadawId}-${discourseSlug}`,
    accessionCode: meta.accession || `RST. ${String(index + 1).padStart(2, '0')}`,
    slug: discourseSlug,
    collectionSlug,
    sourceFormat: 'rst',
    title: title || discourseSlug.replace(/-/g, ' '),
    chineseTitle: meta.chinese_title || undefined,
    paliSubtitle: meta.pali_subtitle || undefined,
    sayadawId: sayadawInfo.sayadawId,
    sayadawName: sayadawInfo.sayadawName,
    collection,
    language: resolveLanguage(meta.language),
    dateRecorded: meta.date || 'Archive Discourse',
    readingMinutes: 5,
    sourceText: meta.source || 'reStructuredText Archive Entry',
    summary: meta.summary || sections[0]?.paragraphs[0]?.slice(0, 220) || title,
    sections,
    pullQuote:
      meta.pull_quote ||
      sections[0]?.paragraphs[0]?.slice(0, 160) ||
      'Contemplate arising and passing away in the present moment.',
    marginNotes: [],
    footnotes: meta.source ? [{ index: 1, text: meta.source }] : [],
    coverImage: meta.cover_image || undefined,
    audioReferenceUrl: meta.audio || undefined,
    mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
    repoPath: filePath.replace(/^\/+/, ''),
  };

  draft.readingMinutes = calculateEstimatedReadingMinutes(draft);
  return draft;
}

export function loadBundledArticleDiscourses(sayadaws: SayadawProfile[]): DhammaDiscourse[] {
  const entries = Object.entries(rawArticleModules).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([filePath, raw], idx) =>
    filePath.toLowerCase().endsWith('.rst')
      ? parseRstArticle(filePath, raw, sayadaws, idx)
      : parseMarkdownArticle(filePath, raw, sayadaws, idx),
  );
}

export function discourseToRst(d: DhammaDiscourse, sayadaws: SayadawProfile[]): string {
  const sSlug = getSayadawSlug(d.sayadawId, sayadaws, d.sayadawName);
  const cSlug = getCollectionSlug(d);
  const dSlug = getDiscourseSlug(d);
  const underline = '='.repeat(Math.max(12, Math.min(72, d.title.length)));

  const lines: string[] = [
    underline,
    d.title,
    underline,
    '',
    `:sayadaw: ${d.sayadawName}`,
    `:sayadaw_slug: ${sSlug}`,
    `:collection: ${d.collection}`,
    `:collection_slug: ${cSlug}`,
    `:slug: ${dSlug}`,
    `:language: ${d.language}`,
    `:date: ${d.dateRecorded}`,
    `:source: ${d.sourceText}`,
    `:summary: ${d.summary}`,
    `:pull_quote: ${d.pullQuote}`,
  ];

  if (d.coverImage) lines.push(`:cover_image: ${d.coverImage}`);
  if (d.audioReferenceUrl) lines.push(`:audio: ${d.audioReferenceUrl}`);

  lines.push('');

  if (d.coverImage) {
    lines.push(`.. image:: ${d.coverImage}`, '');
  }

  if (d.mediaItems) {
    for (const item of d.mediaItems) {
      if (item.type === 'audio' || item.type === 'video' || item.type === 'image') {
        lines.push(`.. ${item.type}:: ${item.url}`, '');
      }
    }
  }

  for (const sec of d.sections) {
    const secLine = '-'.repeat(Math.max(8, Math.min(64, sec.heading.length)));
    lines.push(sec.heading, secLine, '');
    if (sec.paliExcerpt) {
      lines.push(`   *${sec.paliExcerpt}*`, '');
      if (sec.paliTranslation) {
        lines.push(`   — ${sec.paliTranslation}`, '');
      }
    }
    for (const p of sec.paragraphs) {
      lines.push(p, '');
    }
  }

  return lines.join('\n');
}
