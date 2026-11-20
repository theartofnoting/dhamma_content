import {
  COLLECTION_PREFIXES,
  DEFAULT_LOCALE,
  DISCOURSE_LANGUAGES,
  EVENT_STATUSES,
  EVENT_TYPES,
  SITE_LOCALES,
  TIP_CATEGORIES,
  TRADITION_COLLECTIONS,
} from './taxonomy';
import { NavSection, SiteLocale } from '../types/dhamma';

const ENV_OWNER = (import.meta.env.VITE_GITHUB_OWNER as string | undefined)?.trim();
const ENV_REPO = (import.meta.env.VITE_GITHUB_REPO as string | undefined)?.trim();
const GITHUB_OWNER = ENV_OWNER || 'theartofnoting';
const GITHUB_REPO_NAME = ENV_REPO || 'dhamma_content';
const GITHUB_REPO_SLUG = `${GITHUB_OWNER}/${GITHUB_REPO_NAME}`;
const BASE_URL = import.meta.env.BASE_URL || '/';

export const GITHUB_CONFIG = {
  owner: GITHUB_OWNER,
  repoName: GITHUB_REPO_NAME,
  repoSlug: GITHUB_REPO_SLUG,
  repoUrl: `https://github.com/${GITHUB_REPO_SLUG}`,
  actionsUrl: `https://github.com/${GITHUB_REPO_SLUG}/actions`,
  pagesHost: `${GITHUB_OWNER}.github.io/${GITHUB_REPO_NAME}`,
  pagesUrl: `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO_NAME}/`,
  pagesBasePath: `/${GITHUB_REPO_NAME}/`,
  manifestPath: 'content/archive.json',
  articlesRoot: 'content/articles',
  mediaRoot: 'content/media',
} as const;

export const SITE_CONFIG = {
  brandTitle: 'Vipassana Bhavana',
  defaultLocale: DEFAULT_LOCALE,
  heroImage: `${BASE_URL}src/assets/images/hero_monastery_library_1795114132971.jpg`,
  licenseShort: 'CC BY-NC-SA 4.0 (Dhamma-dāna · Vipassana Bhavana)',
  icsProdId: '-//Vipassana Bhavana//Dhamma Page//VI',
  icsDomain: `${GITHUB_OWNER}.github.io`,
  maxUploadBytes: 4_000_000,
  maxPortraitBytes: 2_000_000,
} as const;

export interface LocaleOption {
  code: SiteLocale;
  nativeLabel: string;
  englishName: string;
  shortCode: string;
}

export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { code: 'vi', nativeLabel: 'Tiếng Việt', englishName: 'Vietnamese', shortCode: 'VI' },
  { code: 'en', nativeLabel: 'English', englishName: 'English', shortCode: 'EN' },
  { code: 'my', nativeLabel: 'မြန်မာဘာသာ', englishName: 'Burmese', shortCode: 'MY' },
] as const;

export type PrimaryNavId = 'discourses' | 'sayadaws' | 'tips' | 'events' | 'forms';

export const NAV_SECTION_LIST: { id: PrimaryNavId; sectionId: string }[] = [
  { id: 'discourses', sectionId: 'catalog-section' },
  { id: 'sayadaws', sectionId: 'sayadaws-section' },
  { id: 'tips', sectionId: 'tips-section' },
  { id: 'events', sectionId: 'events-section' },
  { id: 'forms', sectionId: 'forms-section' },
];

export const SECTION_IDS: Record<Exclude<NavSection, 'reader' | 'login'>, string> = {
  discourses: 'catalog-section',
  sayadaws: 'sayadaws-section',
  tips: 'tips-section',
  events: 'events-section',
  forms: 'forms-section',
  github: 'github-section',
};

export const TAXONOMY = {
  locales: SITE_LOCALES,
  collections: TRADITION_COLLECTIONS,
  collectionPrefixes: COLLECTION_PREFIXES,
  languages: DISCOURSE_LANGUAGES,
  tipCategories: TIP_CATEGORIES,
  eventTypes: EVENT_TYPES,
  eventStatuses: EVENT_STATUSES,
  formHeightOptions: [
    { key: 'compact' as const, px: 560 },
    { key: 'standard' as const, px: 760 },
    { key: 'tall' as const, px: 960 },
  ],
} as const;

export const STORAGE_KEYS = {
  discourses: 'vipassana_bhavana_stored_discourses_v2',
  sayadaws: 'vipassana_bhavana_sayadaws_v2',
  tips: 'vipassana_bhavana_tips_v2',
  events: 'vipassana_bhavana_events_v2',
  formTabs: 'vipassana_bhavana_forms_v2',
  deletedPaths: 'vipassana_bhavana_deleted_paths_v2',
  bookmarks: 'vipassana_bhavana_bookmarks_v2',
  prefs: 'vipassana_bhavana_reader_prefs_v2',
  dirtyDraft: 'vipassana_bhavana_dirty_draft_v2',
  patSession: 'vipassana_bhavana_owner_pat_v2',
  userSession: 'vipassana_bhavana_owner_user_v2',
} as const;

export const LEGACY_STORAGE_KEYS: Partial<Record<keyof typeof STORAGE_KEYS, string>> = {
  discourses: 'nanda_dhamma_stored_discourses_v1',
  sayadaws: 'vipassana_bhavana_sayadaws_v1',
  tips: 'vipassana_bhavana_tips_v1',
  events: 'vipassana_bhavana_events_v1',
  formTabs: 'vipassana_bhavana_forms_v1',
  deletedPaths: 'vipassana_bhavana_deleted_paths_v1',
  bookmarks: 'nanda_dhamma_bookmarks_v1',
  prefs: 'nanda_dhamma_reader_prefs_v1',
  dirtyDraft: 'vipassana_bhavana_dirty_draft_v1',
  patSession: 'vipassana_bhavana_owner_pat_v1',
  userSession: 'vipassana_bhavana_owner_user_v1',
};
