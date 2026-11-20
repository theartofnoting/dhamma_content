import { DhammaDiscourse } from '../types/dhamma';

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

  const paliExcerptsCount = discourse.sections.filter((s) => Boolean(s.paliExcerpt)).length;
  const studyBufferMinutes =
    Math.min(4, discourse.marginNotes.length) * 0.75 + paliExcerptsCount * 0.75;

  const rawMinutes = wordCount / 125 + cjkCount / 260 + studyBufferMinutes;
  return Math.max(2, Math.round(rawMinutes));
}
