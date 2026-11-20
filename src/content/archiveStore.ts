import { GITHUB_CONFIG, STORAGE_KEYS } from '../config/siteConfig';
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

function readJsonFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readArrayFromStorage<T>(key: string, fallback: T[]): T[] {
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

export const loadStoredDiscourses = (fallback: DhammaDiscourse[] = []): DhammaDiscourse[] =>
  readArrayFromStorage<DhammaDiscourse>(STORAGE_KEYS.discourses, fallback);

export const saveStoredDiscourses = (discourses: DhammaDiscourse[]): void =>
  writeJsonToStorage(STORAGE_KEYS.discourses, discourses);

export const loadStoredDeletedPaths = (): string[] =>
  readArrayFromStorage<string>(STORAGE_KEYS.deletedPaths, []);

export const saveStoredDeletedPaths = (paths: string[]): void =>
  writeJsonToStorage(STORAGE_KEYS.deletedPaths, paths);

export const loadStoredTips = (fallback: MeditationTip[] = []): MeditationTip[] =>
  readArrayFromStorage<MeditationTip>(STORAGE_KEYS.tips, fallback);

export const saveStoredTips = (tips: MeditationTip[]): void =>
  writeJsonToStorage(STORAGE_KEYS.tips, tips);

export const loadStoredEvents = (fallback: GroupEvent[] = []): GroupEvent[] =>
  readArrayFromStorage<GroupEvent>(STORAGE_KEYS.events, fallback);

export const saveStoredEvents = (events: GroupEvent[]): void =>
  writeJsonToStorage(STORAGE_KEYS.events, events);

export const loadStoredFormTabs = (fallback: GoogleFormTab[] = []): GoogleFormTab[] =>
  readArrayFromStorage<GoogleFormTab>(STORAGE_KEYS.formTabs, fallback);

export const saveStoredFormTabs = (tabs: GoogleFormTab[]): void =>
  writeJsonToStorage(STORAGE_KEYS.formTabs, tabs);

export const loadStoredCustomSayadaws = (): SayadawProfile[] =>
  readArrayFromStorage<SayadawProfile>(STORAGE_KEYS.sayadaws, []);

export const saveStoredCustomSayadaws = (sayadaws: SayadawProfile[]): void =>
  writeJsonToStorage(STORAGE_KEYS.sayadaws, sayadaws);

export const loadBookmarks = (): string[] =>
  readArrayFromStorage<string>(STORAGE_KEYS.bookmarks, []);

export const saveBookmarks = (ids: string[]): void =>
  writeJsonToStorage(STORAGE_KEYS.bookmarks, ids);

export function loadReaderPrefs(): ReaderPreferences {
  const parsed = readJsonFromStorage<Partial<ReaderPreferences>>(STORAGE_KEYS.prefs, {});
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
    return localStorage.getItem(STORAGE_KEYS.dirtyDraft) === '1';
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
    // Ignore
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
    // Ignore
  }
}

export function buildIndexedSayadaws(
  managedSayadaws: SayadawProfile[],
  discourses: DhammaDiscourse[],
): SayadawProfile[] {
  const byId = new Map<string, SayadawProfile>();
  for (const s of managedSayadaws) {
    byId.set(s.id, s);
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
  const result = [...primary];
  const seenIds = new Set(primary.map((d) => d.id));
  const seenSlugs = new Set(primary.map((d) => d.slug).filter(Boolean));
  const seenRepoPaths = new Set(primary.map((d) => d.repoPath).filter(Boolean));
  for (const item of secondary) {
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
    return data;
  } catch {
    return null;
  }
}
