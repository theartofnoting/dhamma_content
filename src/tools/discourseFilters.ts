import {
  DhammaDiscourse,
  DiscourseLanguage,
  SayadawProfile,
  TraditionCollection,
} from '../types/dhamma';
import { calculateEstimatedReadingMinutes } from './readingTime';

export interface DiscourseFilterCriteria {
  searchQuery: string;
  collection: TraditionCollection | 'All';
  sayadawId: string;
  language: DiscourseLanguage | 'All';
  onlySaved: boolean;
  bookmarks: string[];
}

export interface SayadawDiscourseGroup {
  sayadawId: string;
  sayadawName: string;
  items: DhammaDiscourse[];
}

export function filterDiscourses(
  discourses: DhammaDiscourse[],
  criteria: DiscourseFilterCriteria,
): DhammaDiscourse[] {
  const query = criteria.searchQuery.trim().toLowerCase();

  return discourses.filter((d) => {
    if (criteria.collection !== 'All' && d.collection !== criteria.collection) {
      return false;
    }
    if (criteria.sayadawId !== 'All' && d.sayadawId !== criteria.sayadawId) {
      return false;
    }
    if (criteria.language !== 'All' && d.language !== criteria.language) {
      return false;
    }
    if (criteria.onlySaved && !criteria.bookmarks.includes(d.id)) {
      return false;
    }
    if (!query) {
      return true;
    }

    const haystack = [
      d.title,
      d.vietnameseTitle || '',
      d.paliSubtitle || '',
      d.sayadawName,
      d.collection,
      d.sourceText,
      d.summary,
      d.accessionCode,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function selectEditorialTiers(
  filtered: DhammaDiscourse[],
  isFiltering: boolean,
): {
  leadDiscourse: DhammaDiscourse | undefined;
  secondaryDiscourses: DhammaDiscourse[];
} {
  if (isFiltering || filtered.length === 0) {
    return { leadDiscourse: undefined, secondaryDiscourses: [] };
  }

  const leadDiscourse = filtered.find((d) => d.featuredRank === 'lead') || filtered[0];
  const secondaryExplicit = filtered.filter(
    (d) => d.id !== leadDiscourse.id && d.featuredRank === 'secondary',
  );
  const secondaryDiscourses =
    secondaryExplicit.length > 0
      ? secondaryExplicit.slice(0, 2)
      : filtered.filter((d) => d.id !== leadDiscourse.id).slice(0, 2);

  return { leadDiscourse, secondaryDiscourses };
}

export function groupDiscoursesBySayadaw(
  filtered: DhammaDiscourse[],
  sayadaws: SayadawProfile[],
): SayadawDiscourseGroup[] {
  const grouped = new Map<string, SayadawDiscourseGroup>();

  for (const s of sayadaws) {
    grouped.set(s.id, {
      sayadawId: s.id,
      sayadawName: s.vietnameseName ? `${s.name} (${s.vietnameseName})` : s.name,
      items: [],
    });
  }

  for (const d of filtered) {
    const existing = grouped.get(d.sayadawId);
    if (existing) {
      existing.items.push(d);
    } else {
      grouped.set(d.sayadawId, {
        sayadawId: d.sayadawId,
        sayadawName: d.sayadawName,
        items: [d],
      });
    }
  }

  return Array.from(grouped.values()).filter((group) => group.items.length > 0);
}

export function buildReadingTimeMap(discourses: DhammaDiscourse[]): {
  byId: Map<string, number>;
  totalMinutes: number;
} {
  const byId = new Map<string, number>();
  let totalMinutes = 0;

  for (const d of discourses) {
    const est = calculateEstimatedReadingMinutes(d);
    byId.set(d.id, est);
    totalMinutes += est;
  }

  return { byId, totalMinutes };
}
