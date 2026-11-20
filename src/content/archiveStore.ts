import { GITHUB_CONFIG, LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '../config/siteConfig';
import { resolveAssetUrl } from '../plugins/mediaResolver';
import {
  DhammaDiscourse,
  GoogleFormTab,
  GroupEvent,
  MeditationTip,
  PublishedContentManifest,
  ReaderPreferences,
  SayadawProfile,
} from '../types/dhamma';

function readRawWithLegacyFallback(key: keyof typeof STORAGE_KEYS): string | null {
  try {
    const primaryKey = STORAGE_KEYS[key];
    const current = localStorage.getItem(primaryKey);
    if (current !== null) return current;

    const legacyKey = LEGACY_STORAGE_KEYS[key];
    if (!legacyKey) return null;
    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue !== null) {
      localStorage.setItem(primaryKey, legacyValue);
      localStorage.removeItem(legacyKey);
      return legacyValue;
    }
    return null;
  } catch {
    return null;
  }
}

function readJsonFromStorage<T>(key: keyof typeof STORAGE_KEYS, fallback: T): T {
  try {
    const raw = readRawWithLegacyFallback(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readArrayFromStorage<T>(key: keyof typeof STORAGE_KEYS, fallback: T[]): T[] {
  const parsed = readJsonFromStorage<unknown>(key, fallback);
  return Array.isArray(parsed) ? (parsed as T[]) : fallback;
}

function writeJsonToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function normalizeSayadawProfile(raw: SayadawProfile & { chineseName?: string }): SayadawProfile {
  const { chineseName, ...rest } = raw;
  return {
    ...rest,
    vietnameseName: rest.vietnameseName || chineseName || undefined,
  };
}

export function normalizeDiscourseRecord(
  raw: DhammaDiscourse & { chineseTitle?: string },
): DhammaDiscourse {
  const { chineseTitle, ...rest } = raw;
  return {
    ...rest,
    vietnameseTitle: rest.vietnameseTitle || chineseTitle || undefined,
  };
}

export const loadStoredDiscourses = (fallback: DhammaDiscourse[] = []): DhammaDiscourse[] =>
  readArrayFromStorage<DhammaDiscourse>('discourses', fallback).map(normalizeDiscourseRecord);

export const saveStoredDiscourses = (discourses: DhammaDiscourse[]): void =>
  writeJsonToStorage(STORAGE_KEYS.discourses, discourses);

export const loadStoredDeletedPaths = (): string[] =>
  readArrayFromStorage<string>('deletedPaths', []);

export const saveStoredDeletedPaths = (paths: string[]): void =>
  writeJsonToStorage(STORAGE_KEYS.deletedPaths, paths);

export const loadStoredTips = (fallback: MeditationTip[] = []): MeditationTip[] =>
  readArrayFromStorage<MeditationTip>('tips', fallback);

export const saveStoredTips = (tips: MeditationTip[]): void =>
  writeJsonToStorage(STORAGE_KEYS.tips, tips);

export const loadStoredEvents = (fallback: GroupEvent[] = []): GroupEvent[] =>
  readArrayFromStorage<GroupEvent>('events', fallback);

export const saveStoredEvents = (events: GroupEvent[]): void =>
  writeJsonToStorage(STORAGE_KEYS.events, events);

export const loadStoredFormTabs = (fallback: GoogleFormTab[] = []): GoogleFormTab[] =>
  readArrayFromStorage<GoogleFormTab>('formTabs', fallback);

export const saveStoredFormTabs = (tabs: GoogleFormTab[]): void =>
  writeJsonToStorage(STORAGE_KEYS.formTabs, tabs);

export const loadStoredCustomSayadaws = (): SayadawProfile[] =>
  readArrayFromStorage<SayadawProfile>('sayadaws', []).map(normalizeSayadawProfile);

export const saveStoredCustomSayadaws = (sayadaws: SayadawProfile[]): void =>
  writeJsonToStorage(STORAGE_KEYS.sayadaws, sayadaws);

export const loadBookmarks = (): string[] => readArrayFromStorage<string>('bookmarks', []);

export const saveBookmarks = (ids: string[]): void => writeJsonToStorage(STORAGE_KEYS.bookmarks, ids);

export function loadReaderPrefs(): ReaderPreferences {
  const parsed = readJsonFromStorage<Partial<ReaderPreferences>>('prefs', {});
  return {
    fontSize:
      parsed.fontSize === 'small' || parsed.fontSize === 'large' ? parsed.fontSize : 'standard',
    darkMode: Boolean(parsed.darkMode),
  };
}

export const saveReaderPrefs = (prefs: ReaderPreferences): void =>
  writeJsonToStorage(STORAGE_KEYS.prefs, prefs);

export function hasDirtyDraftFlag(): boolean {
  try {
    return readRawWithLegacyFallback('dirtyDraft') === '1';
  } catch {
    return false;
  }
}

export function setDirtyDraftFlag(dirty: boolean): void {
  try {
    if (dirty) {
      localStorage.setItem(STORAGE_KEYS.dirtyDraft, '1');
    } else {
      localStorage.removeItem(STORAGE_KEYS.dirtyDraft);
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearAllStoredArchive(): void {
  const keysToClear = [
    STORAGE_KEYS.discourses,
    STORAGE_KEYS.sayadaws,
    STORAGE_KEYS.tips,
    STORAGE_KEYS.events,
    STORAGE_KEYS.formTabs,
    STORAGE_KEYS.deletedPaths,
    STORAGE_KEYS.dirtyDraft,
  ];
  try {
    for (const key of keysToClear) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors
  }
}

export function buildIndexedSayadaws(
  managedSayadaws: SayadawProfile[],
  discourses: DhammaDiscourse[],
): SayadawProfile[] {
  const byId = new Map<string, SayadawProfile>();
  for (const s of managedSayadaws) {
    byId.set(s.id, normalizeSayadawProfile(s));
  }

  for (const d of discourses) {
    if (d.sayadawId && !byId.has(d.sayadawId)) {
      byId.set(d.sayadawId, {
        id: d.sayadawId,
        slug: d.sayadawId,
        name: d.sayadawName || d.sayadawId,
        honorificTitle: 'Sayadaw Lineage',
        monastery: '',
        location: '',
        lineage: d.collection,
        years: '',
        biography: `Discourses indexed under ${d.sayadawName || d.sayadawId}.`,
        primaryTexts: [d.sourceText].filter(Boolean),
      });
    }
  }
  return Array.from(byId.values());
}

export function mergeDiscourseSources(
  primary: DhammaDiscourse[],
  secondary: DhammaDiscourse[],
): DhammaDiscourse[] {
  const result = primary.map(normalizeDiscourseRecord);
  const seenIds = new Set(result.map((d) => d.id));
  const seenSlugs = new Set(result.map((d) => d.slug).filter(Boolean));
  const seenRepoPaths = new Set(result.map((d) => d.repoPath).filter(Boolean));

  for (const rawItem of secondary) {
    const item = normalizeDiscourseRecord(rawItem);
    if (seenIds.has(item.id)) continue;
    if (item.slug && seenSlugs.has(item.slug)) continue;
    if (item.repoPath && seenRepoPaths.has(item.repoPath)) continue;
    result.push(item);
    seenIds.add(item.id);
    if (item.slug) seenSlugs.add(item.slug);
    if (item.repoPath) seenRepoPaths.add(item.repoPath);
  }
  return result;
}

export async function fetchPublishedManifest(): Promise<PublishedContentManifest | null> {
  try {
    const url = `${resolveAssetUrl(GITHUB_CONFIG.manifestPath)}?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as PublishedContentManifest;
    if (!data || !Array.isArray(data.discourses)) return null;
    return {
      ...data,
      discourses: data.discourses.map(normalizeDiscourseRecord),
      sayadaws: data.sayadaws?.map(normalizeSayadawProfile),
      customSayadaws: data.customSayadaws?.map(normalizeSayadawProfile),
    };
  } catch {
    return null;
  }
}
