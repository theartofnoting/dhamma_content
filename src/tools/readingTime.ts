import { DhammaDiscourse } from '../types/dhamma';

export function calculateEstimatedReadingMinutes(discourse: DhammaDiscourse): number {
  const textParts: string[] = [
    discourse.title,
    discourse.vietnameseTitle || '',
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
  const wordCount = combined
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const paliExcerptsCount = discourse.sections.filter((s) => Boolean(s.paliExcerpt)).length;
  const studyBufferMinutes =
    Math.min(4, discourse.marginNotes.length) * 0.75 + paliExcerptsCount * 0.75;

  const rawMinutes = wordCount / 145 + studyBufferMinutes;
  return Math.max(2, Math.round(rawMinutes));
}
