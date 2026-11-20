import { DEFAULT_LOCALE } from '../config/taxonomy';
import { isSupportedLocale } from '../i18n';
import { getCollectionSlug, getDiscourseSlug, getSayadawSlug } from '../tools/slugify';
import { DhammaDiscourse, SayadawProfile, SiteLocale } from '../types/dhamma';

function normalizedBasePrefix(): string {
  return (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
}

export function buildLocalizedPrefix(locale: SiteLocale): string {
  const base = normalizedBasePrefix();
  return `${base}/${locale}`;
}

export function buildHomePath(locale: SiteLocale = DEFAULT_LOCALE): string {
  return `${buildLocalizedPrefix(locale)}/`;
}

export function buildSayadawPath(sayadawSlug: string, locale: SiteLocale = DEFAULT_LOCALE): string {
  return `${buildLocalizedPrefix(locale)}/${sayadawSlug}/`;
}

export function buildDiscoursePath(
  discourse: DhammaDiscourse,
  sayadaws: SayadawProfile[],
  locale: SiteLocale = DEFAULT_LOCALE,
): string {
  const sSlug = getSayadawSlug(discourse.sayadawId, sayadaws, discourse.sayadawName);
  const cSlug = getCollectionSlug(discourse);
  const dSlug = getDiscourseSlug(discourse);
  return `${buildLocalizedPrefix(locale)}/${sSlug}/${cSlug}/${dSlug}/`;
}

export function buildLoginPath(locale: SiteLocale = DEFAULT_LOCALE): string {
  return `${buildLocalizedPrefix(locale)}/login`;
}

export function pushBrowserPath(targetPath: string): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== targetPath) {
    window.history.pushState({}, '', targetPath);
  }
}

export function stripBasePath(pathname: string): string[] {
  const base = normalizedBasePrefix();
  let rel = pathname;
  if (base && rel.startsWith(base)) {
    rel = rel.slice(base.length);
  }
  return rel
    .split('/')
    .map((seg) => decodeURIComponent(seg).trim())
    .filter(Boolean);
}

export function extractLocaleFromPath(pathname: string): {
  locale: SiteLocale;
  hasExplicitLocale: boolean;
  segments: string[];
} {
  const segments = stripBasePath(pathname);
  const candidate = segments[0]?.toLowerCase();
  if (isSupportedLocale(candidate)) {
    return {
      locale: candidate,
      hasExplicitLocale: true,
      segments: segments.slice(1),
    };
  }
  return {
    locale: DEFAULT_LOCALE,
    hasExplicitLocale: false,
    segments,
  };
}

export function buildSwitchedLocalePath(currentPathname: string, targetLocale: SiteLocale): string {
  const { segments } = extractLocaleFromPath(currentPathname);
  const prefix = buildLocalizedPrefix(targetLocale);
  if (segments.length === 0) {
    return `${prefix}/`;
  }
  const trailingSlash = currentPathname.endsWith('/') ? '/' : '';
  return `${prefix}/${segments.join('/')}${trailingSlash}`;
}

export type ParsedRouteKind =
  | { kind: 'home' }
  | { kind: 'login' }
  | { kind: 'github' }
  | { kind: 'sayadaw'; sayadawId: string; sayadawSlug: string; collectionSlug?: string }
  | { kind: 'discourse'; discourse: DhammaDiscourse }
  | { kind: 'not-found'; rawSegments: string[] };

export interface ParsedAppRoute {
  locale: SiteLocale;
  route: ParsedRouteKind;
}

export function parseAppRoute(
  pathname: string,
  discourses: DhammaDiscourse[],
  sayadaws: SayadawProfile[],
): ParsedAppRoute {
  const { locale, segments } = extractLocaleFromPath(pathname);

  if (segments.length === 0) {
    return { locale, route: { kind: 'home' } };
  }

  const first = segments[0].toLowerCase();
  if (first === 'login' || first === 'admin') {
    return { locale, route: { kind: 'login' } };
  }
  if (first === 'github' || first === 'deploy') {
    return { locale, route: { kind: 'github' } };
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
      return { locale, route: { kind: 'discourse', discourse: match } };
    }

    const fallbackBySlug = discourses.find(
      (d) =>
        getDiscourseSlug(d).toLowerCase() === dSeg.toLowerCase() ||
        d.id.toLowerCase() === dSeg.toLowerCase(),
    );
    if (fallbackBySlug) {
      return { locale, route: { kind: 'discourse', discourse: fallbackBySlug } };
    }

    return { locale, route: { kind: 'not-found', rawSegments: segments } };
  }

  const [sSeg, cSeg] = segments;
  const matchedSayadaw = sayadaws.find(
    (s) =>
      (s.slug && s.slug.toLowerCase() === sSeg.toLowerCase()) ||
      s.id.toLowerCase() === sSeg.toLowerCase(),
  );
  if (matchedSayadaw) {
    return {
      locale,
      route: {
        kind: 'sayadaw',
        sayadawId: matchedSayadaw.id,
        sayadawSlug: getSayadawSlug(matchedSayadaw.id, sayadaws),
        collectionSlug: cSeg,
      },
    };
  }

  const singleDiscourse = discourses.find(
    (d) =>
      getDiscourseSlug(d).toLowerCase() === sSeg.toLowerCase() ||
      d.id.toLowerCase() === sSeg.toLowerCase(),
  );
  if (singleDiscourse) {
    return { locale, route: { kind: 'discourse', discourse: singleDiscourse } };
  }

  return { locale, route: { kind: 'not-found', rawSegments: segments } };
}
