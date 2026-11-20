import { DhammaDiscourse, SayadawProfile } from '../types/dhamma';

export function slugifySegment(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9%_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 72) || 'entry'
  );
}

export function getSayadawSlug(
  sayadawId: string,
  sayadaws: SayadawProfile[],
  fallbackName?: string,
): string {
  const found = sayadaws.find((s) => s.id === sayadawId || s.slug === sayadawId);
  if (found?.slug) return found.slug;
  if (found) return slugifySegment(found.id || found.name);
  if (sayadawId) return slugifySegment(sayadawId);
  return slugifySegment(fallbackName || 'sayadaw');
}

export function getCollectionSlug(discourse: DhammaDiscourse): string {
  if (discourse.collectionSlug) return discourse.collectionSlug;
  return slugifySegment(discourse.collection);
}

export function getDiscourseSlug(discourse: DhammaDiscourse): string {
  if (discourse.slug) return discourse.slug;
  return slugifySegment(discourse.title);
}
