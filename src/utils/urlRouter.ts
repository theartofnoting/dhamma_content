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

export function buildSayadawPath(sayadawSlug: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  return `${base}/${sayadawSlug}/`;
}

export function buildDiscoursePath(
  discourse: DhammaDiscourse,
  sayadaws: SayadawProfile[],
): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const sSlug = getSayadawSlug(discourse.sayadawId, sayadaws, discourse.sayadawName);
  const cSlug = getCollectionSlug(discourse);
  const dSlug = getDiscourseSlug(discourse);
  return `${base}/${sSlug}/${cSlug}/${dSlug}/`;
}

export function buildLoginPath(): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  return `${base}/login`;
}

export function buildHomePath(): string {
  return import.meta.env.BASE_URL || '/';
}

export type ParsedAppRoute =
  | { kind: 'home' }
  | { kind: 'login' }
  | { kind: 'github' }
  | { kind: 'sayadaw'; sayadawId: string; sayadawSlug: string; collectionSlug?: string }
  | { kind: 'discourse'; discourse: DhammaDiscourse }
  | { kind: 'not-found'; rawSegments: string[] };

export function stripBasePath(pathname: string): string[] {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  let rel = pathname;
  if (base && rel.startsWith(base)) {
    rel = rel.slice(base.length);
  }
  return rel
    .split('/')
    .map((seg) => decodeURIComponent(seg).trim())
    .filter(Boolean);
}

export function parseAppRoute(
  pathname: string,
  discourses: DhammaDiscourse[],
  sayadaws: SayadawProfile[],
): ParsedAppRoute {
  const segments = stripBasePath(pathname);
  if (segments.length === 0) {
    return { kind: 'home' };
  }

  const first = segments[0].toLowerCase();
  if (first === 'login' || first === 'admin') {
    return { kind: 'login' };
  }
  if (first === 'github' || first === 'deploy') {
    return { kind: 'github' };
  }

  if (segments.length >= 3) {
    const [sSeg, cSeg, dSeg] = segments;
    const match = discourses.find((d) => {
      const sSlug = getSayadawSlug(d.sayadawId, sayadaws, d.sayadawName).toLowerCase();
      const cSlug = getCollectionSlug(d).toLowerCase();
      const dSlug = getDiscourseSlug(d).toLowerCase();
      return (
        (sSlug === sSeg.toLowerCase() || d.sayadawId.toLowerCase() === sSeg.toLowerCase()) &&
        cSlug === cSeg.toLowerCase() &&
        (dSlug === dSeg.toLowerCase() || d.id.toLowerCase() === dSeg.toLowerCase())
      );
    });
    if (match) {
      return { kind: 'discourse', discourse: match };
    }
    const fallbackBySlug = discourses.find(
      (d) =>
        getDiscourseSlug(d).toLowerCase() === dSeg.toLowerCase() ||
        d.id.toLowerCase() === dSeg.toLowerCase(),
    );
    if (fallbackBySlug) {
      return { kind: 'discourse', discourse: fallbackBySlug };
    }
    return { kind: 'not-found', rawSegments: segments };
  }

  if (segments.length >= 1) {
    const [sSeg, cSeg] = segments;
    const matchedSayadaw = sayadaws.find(
      (s) =>
        (s.slug && s.slug.toLowerCase() === sSeg.toLowerCase()) ||
        s.id.toLowerCase() === sSeg.toLowerCase(),
    );
    if (matchedSayadaw) {
      return {
        kind: 'sayadaw',
        sayadawId: matchedSayadaw.id,
        sayadawSlug: getSayadawSlug(matchedSayadaw.id, sayadaws),
        collectionSlug: cSeg,
      };
    }
    // Single segment might also be a direct discourse id/slug
    const singleDiscourse = discourses.find(
      (d) =>
        getDiscourseSlug(d).toLowerCase() === sSeg.toLowerCase() ||
        d.id.toLowerCase() === sSeg.toLowerCase(),
    );
    if (singleDiscourse) {
      return { kind: 'discourse', discourse: singleDiscourse };
    }
  }

  return { kind: 'not-found', rawSegments: segments };
}
