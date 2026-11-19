import {
  DhammaDiscourse,
  GitHubContentEntry,
  GitHubRepoInfo,
  GoogleFormTab,
  GroupEvent,
  MeditationTip,
  ReaderPreferences,
} from '../types/dhamma';

const STORED_DISCOURSES_KEY = 'nanda_dhamma_stored_discourses_v1';
const STORED_TIPS_KEY = 'vipassana_bhavana_tips_v1';
const STORED_EVENTS_KEY = 'vipassana_bhavana_events_v1';
const STORED_FORMS_KEY = 'vipassana_bhavana_forms_v1';
const BOOKMARKS_KEY = 'nanda_dhamma_bookmarks_v1';
const PREFS_KEY = 'nanda_dhamma_reader_prefs_v1';

export function loadStoredDiscourses(seed: DhammaDiscourse[]): DhammaDiscourse[] {
  try {
    const raw = localStorage.getItem(STORED_DISCOURSES_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as DhammaDiscourse[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

export function saveStoredDiscourses(discourses: DhammaDiscourse[]): void {
  try {
    localStorage.setItem(STORED_DISCOURSES_KEY, JSON.stringify(discourses));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function loadStoredTips(seed: MeditationTip[]): MeditationTip[] {
  try {
    const raw = localStorage.getItem(STORED_TIPS_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as MeditationTip[];
    if (!Array.isArray(parsed)) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

export function saveStoredTips(tips: MeditationTip[]): void {
  try {
    localStorage.setItem(STORED_TIPS_KEY, JSON.stringify(tips));
  } catch {
    // Ignore
  }
}

export function loadStoredEvents(seed: GroupEvent[]): GroupEvent[] {
  try {
    const raw = localStorage.getItem(STORED_EVENTS_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as GroupEvent[];
    if (!Array.isArray(parsed)) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

export function saveStoredEvents(events: GroupEvent[]): void {
  try {
    localStorage.setItem(STORED_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Ignore
  }
}

export function loadStoredFormTabs(seed: GoogleFormTab[]): GoogleFormTab[] {
  try {
    const raw = localStorage.getItem(STORED_FORMS_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as GoogleFormTab[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

export function saveStoredFormTabs(tabs: GoogleFormTab[]): void {
  try {
    localStorage.setItem(STORED_FORMS_KEY, JSON.stringify(tabs));
  } catch {
    // Ignore
  }
}

export function clearAllStoredArchive(): void {
  try {
    localStorage.removeItem(STORED_DISCOURSES_KEY);
    localStorage.removeItem(STORED_TIPS_KEY);
    localStorage.removeItem(STORED_EVENTS_KEY);
    localStorage.removeItem(STORED_FORMS_KEY);
  } catch {
    // Ignore
  }
}

export function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(ids: string[]): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
  } catch {
    // Ignore
  }
}

export function loadReaderPrefs(): ReaderPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { fontSize: 'standard', darkMode: false };
    const parsed = JSON.parse(raw) as Partial<ReaderPreferences>;
    return {
      fontSize:
        parsed.fontSize === 'small' || parsed.fontSize === 'large'
          ? parsed.fontSize
          : 'standard',
      darkMode: Boolean(parsed.darkMode),
    };
  } catch {
    return { fontSize: 'standard', darkMode: false };
  }
}

export function saveReaderPrefs(prefs: ReaderPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore
  }
}

/**
 * Normalizes a pasted Google Form URL (or iframe snippet) into a clean embeddable URL.
 */
export function normalizeGoogleFormUrl(input: string): {
  ok: boolean;
  embedUrl?: string;
  error?: string;
} {
  let raw = input.trim();
  if (!raw) {
    return { ok: true, embedUrl: '' };
  }

  // Extract src="..." if user pasted full <iframe src="..."> HTML code
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

  // Convert /edit to /viewform if an organizer pasted the editor link
  if (parsed.pathname.endsWith('/edit')) {
    parsed.pathname = parsed.pathname.replace(/\/edit$/, '/viewform');
  }

  parsed.searchParams.set('embedded', 'true');
  return { ok: true, embedUrl: parsed.toString() };
}

export function eventToIcs(evt: GroupEvent): string {
  const formatIcsDate = (dateStr: string) => dateStr.replace(/-/g, '');
  const start = formatIcsDate(evt.startDate);
  // ICS DTEND for all-day VALUE=DATE is exclusive, so add 1 day cleanly
  const endObj = new Date(`${evt.endDate}T00:00:00Z`);
  endObj.setUTCDate(endObj.getUTCDate() + 1);
  const end = endObj.toISOString().slice(0, 10).replace(/-/g, '');

  const escapeIcs = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vipassana Bhavana//Dhamma Page//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${evt.id}@theartofnoting.github.io`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcs(evt.title)}`,
    `LOCATION:${escapeIcs(evt.locationOrLink)}`,
    `DESCRIPTION:${escapeIcs(`${evt.eventType} · ${evt.teacher} · ${evt.timeRange}\\n\\n${evt.description}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function calculateEstimatedReadingMinutes(discourse: DhammaDiscourse): number {
  const textParts: string[] = [
    discourse.title,
    discourse.chineseTitle || '',
    discourse.paliSubtitle || '',
    discourse.summary,
    discourse.pullQuote,
  ];

  for (const section of discourse.sections) {
    textParts.push(section.heading);
    if (section.paliExcerpt) textParts.push(section.paliExcerpt);
    if (section.paliTranslation) textParts.push(section.paliTranslation);
    textParts.push(...section.paragraphs);
  }

  for (const note of discourse.marginNotes) {
    textParts.push(note.termPali, note.noteText);
  }

  const combined = textParts.join(' ');
  const cjkMatches = combined.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  const nonCjkText = combined.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ');
  const wordCount = nonCjkText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // Reflective Dhamma study pace (~125 WPM English/Pāli, ~260 CPM CJK) + 1 min per Pāli stanza/margin note
  const paliExcerptsCount = discourse.sections.filter((s) => Boolean(s.paliExcerpt)).length;
  const studyBufferMinutes =
    Math.min(4, discourse.marginNotes.length) * 0.75 + paliExcerptsCount * 0.75;

  const rawMinutes = wordCount / 125 + cjkCount / 260 + studyBufferMinutes;
  return Math.max(2, Math.round(rawMinutes));
}

export function discourseToMarkdown(d: DhammaDiscourse): string {
  const frontmatter = [
    '---',
    `accession: "${d.accessionCode}"`,
    `title: "${d.title.replace(/"/g, '\\"')}"`,
    d.chineseTitle ? `chinese_title: "${d.chineseTitle.replace(/"/g, '\\"')}"` : null,
    d.paliSubtitle ? `pali_subtitle: "${d.paliSubtitle.replace(/"/g, '\\"')}"` : null,
    `sayadaw: "${d.sayadawName.replace(/"/g, '\\"')}"`,
    `collection: "${d.collection}"`,
    `language: "${d.language}"`,
    `date_recorded: "${d.dateRecorded}"`,
    `source_text: "${d.sourceText.replace(/"/g, '\\"')}"`,
    `repo_path: "${d.repoPath}"`,
    `license: "CC BY-NC-SA 4.0 (Dhamma-dāna · Vipassana Bhavana)"`,
    '---',
    '',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  const header = [
    `# ${d.title}`,
    d.chineseTitle ? `### ${d.chineseTitle}` : null,
    d.paliSubtitle ? `*${d.paliSubtitle}*` : null,
    '',
    `> **Sayadaw:** ${d.sayadawName}  `,
    `> **Source:** ${d.sourceText}  `,
    `> **Collection:** ${d.collection} · ${d.language}`,
    '',
    d.summary,
    '',
    `> *"${d.pullQuote}"*`,
    '',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  const body = d.sections
    .map((sec) => {
      const parts: string[] = [`## ${sec.heading}`, ''];
      if (sec.paliExcerpt) {
        parts.push(`> **Pāli:** *${sec.paliExcerpt}*`);
        if (sec.paliTranslation) {
          parts.push(`> — ${sec.paliTranslation}`);
        }
        parts.push('');
      }
      sec.paragraphs.forEach((p) => {
        parts.push(p);
        parts.push('');
      });
      return parts.join('\n');
    })
    .join('\n');

  const notes =
    d.marginNotes.length > 0
      ? [
          '## Margin Glossary & Notes',
          '',
          ...d.marginNotes.map(
            (n) =>
              `- **${n.termPali}** (${n.anchorLabel}): ${n.noteText} *(${n.sourceCitation})*`,
          ),
          '',
        ].join('\n')
      : '';

  const footnotes =
    d.footnotes.length > 0
      ? [
          '## Archival Footnotes',
          '',
          ...d.footnotes.map((f) => `${f.index}. ${f.text}`),
          '',
        ].join('\n')
      : '';

  return [frontmatter, header, body, notes, footnotes].join('\n');
}

export function triggerFileDownload(
  filename: string,
  content: string,
  mimeType = 'text/plain;charset=utf-8',
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const GITHUB_PAGES_WORKFLOW_YML = `name: Deploy Vipassana Bhavana to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v6

      - name: Setup Node.js 24
        uses: actions/setup-node@v5
        with:
          node-version: "24"

      - name: Install dependencies
        run: npm install --no-audit --no-fund

      - name: Build static site for GitHub Pages
        env:
          VITE_BASE_PATH: /dhamma_content/
        run: npm run build

      - name: Add SPA fallback for GitHub Pages
        run: cp dist/index.html dist/404.html

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
`;

export async function fetchGitHubRepoSnapshot(
  repoSlug = 'theartofnoting/dhamma_content',
): Promise<{
  repo: GitHubRepoInfo;
  contents: GitHubContentEntry[];
}> {
  const cleanSlug = repoSlug
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '');

  const repoRes = await fetch(`https://api.github.com/repos/${cleanSlug}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!repoRes.ok) {
    throw new Error(`GitHub API responded with status ${repoRes.status} for ${cleanSlug}`);
  }
  const repo = (await repoRes.json()) as GitHubRepoInfo;

  let contents: GitHubContentEntry[] = [];
  const contentsRes = await fetch(`https://api.github.com/repos/${cleanSlug}/contents`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (contentsRes.ok) {
    const rawContents = await contentsRes.json();
    if (Array.isArray(rawContents)) {
      contents = rawContents.slice(0, 18) as GitHubContentEntry[];
    }
  }

  return { repo, contents };
}

