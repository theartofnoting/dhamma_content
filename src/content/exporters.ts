import { GITHUB_CONFIG, SITE_CONFIG } from '../config/siteConfig';
import {
  DhammaDiscourse,
  GroupEvent,
  MeditationTip,
  SayadawProfile,
} from '../types/dhamma';

export function eventToIcs(evt: GroupEvent): string {
  const formatIcsDate = (dateStr: string) => dateStr.replace(/-/g, '');
  const start = formatIcsDate(evt.startDate);
  const endObj = new Date(`${evt.endDate}T00:00:00Z`);
  endObj.setUTCDate(endObj.getUTCDate() + 1);
  const end = endObj.toISOString().slice(0, 10).replace(/-/g, '');

  const escapeIcs = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${SITE_CONFIG.icsProdId}`,
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${evt.id}@${SITE_CONFIG.icsDomain}`,
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

export function discourseToMarkdown(d: DhammaDiscourse): string {
  const frontmatter = [
    '---',
    `accession: "${d.accessionCode}"`,
    `title: "${d.title.replace(/"/g, '\\"')}"`,
    d.vietnameseTitle ? `vietnamese_title: "${d.vietnameseTitle.replace(/"/g, '\\"')}"` : null,
    d.paliSubtitle ? `pali_subtitle: "${d.paliSubtitle.replace(/"/g, '\\"')}"` : null,
    `sayadaw: "${d.sayadawName.replace(/"/g, '\\"')}"`,
    `collection: "${d.collection}"`,
    `language: "${d.language}"`,
    `date_recorded: "${d.dateRecorded}"`,
    `source_text: "${d.sourceText.replace(/"/g, '\\"')}"`,
    d.coverImage ? `cover_image: "${d.coverImage}"` : null,
    d.audioReferenceUrl ? `audio_reference: "${d.audioReferenceUrl}"` : null,
    `repo_path: "${d.repoPath}"`,
    `license: "${SITE_CONFIG.licenseShort}"`,
    '---',
    '',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  const header = [
    `# ${d.title}`,
    d.vietnameseTitle ? `### ${d.vietnameseTitle}` : null,
    d.paliSubtitle ? `*${d.paliSubtitle}*` : null,
    '',
    `> **Sayadaw:** ${d.sayadawName}  `,
    `> **Source:** ${d.sourceText}  `,
    `> **Collection:** ${d.collection} · ${d.language}`,
    d.audioReferenceUrl ? `> **Audio / Media:** ${d.audioReferenceUrl}` : null,
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

  const mediaSection =
    d.mediaItems && d.mediaItems.length > 0
      ? [
          '## Media & Attachments',
          '',
          ...d.mediaItems.map(
            (m) =>
              `- **${m.title}** (${m.type}): ${m.url}${m.caption ? ` — *${m.caption}*` : ''}`,
          ),
          '',
        ].join('\n')
      : '';

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

  return [frontmatter, header, body, mediaSection, notes, footnotes].filter(Boolean).join('\n');
}

export function buildGitHubPagesWorkflowYml(): string {
  return `name: Deploy ${SITE_CONFIG.brandTitle} to GitHub Pages

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
          VITE_BASE_PATH: ${GITHUB_CONFIG.pagesBasePath}
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
}

export function buildArchiveBackupPayload(params: {
  repoSlug: string;
  sayadaws: SayadawProfile[];
  discourses: DhammaDiscourse[];
  tips: MeditationTip[];
  events: GroupEvent[];
}) {
  return {
    name: `${SITE_CONFIG.brandTitle} — Dhamma Page`,
    site: GITHUB_CONFIG.pagesUrl,
    repository: `https://github.com/${params.repoSlug}`,
    exportedAt: new Date().toISOString(),
    license: SITE_CONFIG.licenseShort,
    sayadaws: params.sayadaws,
    discourses: params.discourses,
    meditationTips: params.tips,
    events: params.events,
  };
}
