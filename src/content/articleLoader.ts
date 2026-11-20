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
  const defaultLanguage = TAXONOMY.languages[0];
  if (!raw) return defaultLanguage;

  const exact = TAXONOMY.languages.find((lang) => lang.toLowerCase() === raw.trim().toLowerCase());
  if (exact) return exact;

  const lower = raw.toLowerCase();
  const hasVietnamese = lower.includes('vietnam') || lower.includes('việt');
  const hasEnglish = lower.includes('english');
  const hasPali = lower.includes('pali') || lower.includes('pāli');

  if (hasPali && hasVietnamese && hasEnglish) {
    return (
      TAXONOMY.languages.find(
        (l) => l.includes('Pāli') && l.includes('Vietnamese') && l.includes('English'),
      ) || defaultLanguage
    );
  }
  if (hasVietnamese) {
    return TAXONOMY.languages.find((l) => l.includes('Vietnamese')) || defaultLanguage;
  }
  if (hasPali && hasEnglish) {
    return TAXONOMY.languages.find((l) => l.includes('Pāli') && l.includes('English')) || defaultLanguage;
  }
  if (hasEnglish) {
    return TAXONOMY.languages.find((l) => l === 'English') || defaultLanguage;
  }

  return defaultLanguage;
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

function parseMarkdownFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const normalized = raw.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: normalized };
  }
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line
      .slice(colonIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key) meta[key] = value;
  }
  return { meta, body: match[2] };
}

function parseSectionsFromBody(body: string, fallbackHeading: string): DiscourseSection[] {
  const chunks = body.split(/^##\s+/m);
  const sections: DiscourseSection[] = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const lines = trimmed.split('\n');
    const heading = lines[0].replace(/^#+\s*/, '').trim() || fallbackHeading;
    const paragraphs = lines
      .slice(1)
      .join('\n')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !p.startsWith('# '));

    if (paragraphs.length > 0) {
      sections.push({ heading, paragraphs });
    }
  }

  if (sections.length === 0 && body.trim()) {
    sections.push({
      heading: fallbackHeading,
      paragraphs: body
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean),
    });
  }

  return sections;
}

function parseMarkdownArticle(
  filePath: string,
  raw: string,
  sayadaws: SayadawProfile[],
  index: number,
): DhammaDiscourse {
  const { meta, body } = parseMarkdownFrontmatter(raw);
  const pathInfo = inferPathSegments(filePath);
  const collection = resolveCollection(meta.collection || pathInfo.collectionSlug);
  const sayadawInfo = matchSayadawBySlugOrName(
    meta.sayadaw_slug || pathInfo.sayadawSlug,
    meta.sayadaw,
    sayadaws,
  );
  const headingMatch = body.match(/^#\s+(.+)$/m);
  const title = meta.title || headingMatch?.[1]?.trim() || pathInfo.fileSlug.replace(/-/g, ' ');
  const sections = parseSectionsFromBody(body, title);

  const prefix = TAXONOMY.collectionPrefixes[collection];
  const draft: DhammaDiscourse = {
    id: meta.slug || `${pathInfo.sayadawSlug}-${pathInfo.fileSlug}`,
    accessionCode: meta.accession || `${prefix}-${String(index + 1).padStart(3, '0')}`,
    slug: meta.slug || slugifySegment(pathInfo.fileSlug),
    collectionSlug: meta.collection_slug || pathInfo.collectionSlug,
    sourceFormat: 'md',
    title,
    vietnameseTitle: meta.vietnamese_title || undefined,
    paliSubtitle: meta.pali_subtitle || undefined,
    sayadawId: sayadawInfo.sayadawId,
    sayadawName: sayadawInfo.sayadawName,
    collection,
    language: resolveLanguage(meta.language),
    dateRecorded: meta.date_recorded || meta.date || 'Archive Discourse',
    readingMinutes: 5,
    sourceText: meta.source_text || meta.source || 'Markdown Archive Entry',
    summary: meta.summary || sections[0]?.paragraphs[0]?.slice(0, 220) || title,
    sections,
    pullQuote:
      meta.pull_quote ||
      sections[0]?.paragraphs[0]?.slice(0, 160) ||
      'Contemplate arising and passing away in the present moment.',
    marginNotes: [],
    footnotes: meta.source_text ? [{ index: 1, text: meta.source_text }] : [],
    coverImage: meta.cover_image || undefined,
    audioReferenceUrl: meta.audio_reference || meta.audio || undefined,
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
  const normalized = raw.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const meta: Record<string, string> = {};
  const mediaItems: DiscourseMediaItem[] = [];
  const bodyLines: string[] = [];
  let title = '';

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!title && i + 1 < lines.length && /^[=-]{4,}$/.test(lines[i + 1].trim()) && line.trim()) {
      title = line.trim();
      i += 1;
      continue;
    }

    const fieldMatch = line.match(/^:([a-zA-Z0-9_]+):\s*(.*)$/);
    if (fieldMatch) {
      meta[fieldMatch[1].toLowerCase()] = fieldMatch[2].trim();
      continue;
    }

    const directiveMatch = line.match(/^\.\.\s+(image|audio|video)::\s+(.+)$/i);
    if (directiveMatch) {
      const type = directiveMatch[1].toLowerCase() as 'image' | 'audio' | 'video';
      const url = directiveMatch[2].trim();
      mediaItems.push({
        id: `rst-media-${mediaItems.length + 1}`,
        type,
        title: url.split('/').pop() || type,
        url,
      });
      continue;
    }

    if (/^[=-]{4,}$/.test(line.trim())) {
      continue;
    }
    bodyLines.push(line);
  }

  const pathInfo = inferPathSegments(filePath);
  const collection = resolveCollection(meta.collection || pathInfo.collectionSlug);
  const sayadawInfo = matchSayadawBySlugOrName(
    meta.sayadaw_slug || pathInfo.sayadawSlug,
    meta.sayadaw,
    sayadaws,
  );
  const resolvedTitle = meta.title || title || pathInfo.fileSlug.replace(/-/g, ' ');
  const sections = parseSectionsFromBody(bodyLines.join('\n'), resolvedTitle);
  const prefix = TAXONOMY.collectionPrefixes[collection];

  const draft: DhammaDiscourse = {
    id: meta.slug || `${pathInfo.sayadawSlug}-${pathInfo.fileSlug}`,
    accessionCode: meta.accession || `${prefix}-${String(index + 1).padStart(3, '0')}`,
    slug: meta.slug || slugifySegment(pathInfo.fileSlug),
    collectionSlug: meta.collection_slug || pathInfo.collectionSlug,
    sourceFormat: 'rst',
    title: resolvedTitle,
    vietnameseTitle: meta.vietnamese_title || undefined,
    paliSubtitle: meta.pali_subtitle || undefined,
    sayadawId: sayadawInfo.sayadawId,
    sayadawName: sayadawInfo.sayadawName,
    collection,
    language: resolveLanguage(meta.language),
    dateRecorded: meta.date || 'Archive Discourse',
    readingMinutes: 5,
    sourceText: meta.source || 'reStructuredText Archive Entry',
    summary: meta.summary || sections[0]?.paragraphs[0]?.slice(0, 220) || resolvedTitle,
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

  if (d.vietnameseTitle) lines.push(`:vietnamese_title: ${d.vietnameseTitle}`);
  if (d.paliSubtitle) lines.push(`:pali_subtitle: ${d.paliSubtitle}`);
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
