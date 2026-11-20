import {
  DiscourseLanguage,
  EventStatus,
  EventType,
  NavSection,
  TipCategory,
  TraditionCollection,
} from '../types/dhamma';

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
  pageTitleSuffix: 'Dhamma Page',
  heroKicker: 'Dhamma Page',
  heroHeadline: 'Sayadaw Teachings, Meditation Practice & Group Courses',
  heroDescription:
    'The living Dhamma repository for our Vipassana Bhavana group. Store and read discourses from our Sayadaw teachers, explore practical meditation tips, follow upcoming retreat courses, and submit registrations online.',
  heroImage: `${BASE_URL}src/assets/images/hero_monastery_library_1795114132971.jpg`,
  heroImageAlt:
    'Monastic library desk with palm-leaf manuscripts and bound Pāli volumes in warm morning light',
  heroImageCaption:
    'Fig. 1 — Palm-leaf manuscripts and bound Tipiṭaka study volumes in morning light.',
  licenseShort: 'CC BY-NC-SA 4.0 (Dhamma-dāna · Vipassana Bhavana)',
  licenseFooter:
    'Offered freely under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 for non-commercial practice and study.',
  icsProdId: '-//Vipassana Bhavana//Dhamma Page//EN',
  icsDomain: `${GITHUB_OWNER}.github.io`,
  maxUploadBytes: 4_000_000,
  maxPortraitBytes: 2_000_000,
} as const;

export type PrimaryNavId = 'discourses' | 'sayadaws' | 'tips' | 'events' | 'forms';

export const NAV_ITEMS: { id: PrimaryNavId; label: string; sectionId: string }[] = [
  { id: 'discourses', label: 'Discourses', sectionId: 'catalog-section' },
  { id: 'sayadaws', label: 'Sayadaws', sectionId: 'sayadaws-section' },
  { id: 'tips', label: 'Meditation Tips', sectionId: 'tips-section' },
  { id: 'events', label: 'Events', sectionId: 'events-section' },
  { id: 'forms', label: 'Forms', sectionId: 'forms-section' },
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
  collections: [
    'Abhidhamma',
    'Satipatthana & Vipassana',
    'Sutta Pitaka',
    'Visuddhimagga',
    'Monastic Talks',
  ] as TraditionCollection[],
  collectionPrefixes: {
    Abhidhamma: 'ABH',
    'Satipatthana & Vipassana': 'VIP',
    'Sutta Pitaka': 'SUT',
    Visuddhimagga: 'VIS',
    'Monastic Talks': 'MNK',
  } as Record<TraditionCollection, string>,
  languages: [
    'Pāli · 繁體中文 · English',
    'Pāli · English',
    'English',
    '繁體中文',
  ] as DiscourseLanguage[],
  tipCategories: [
    'Breath & Anchor',
    'Posture & Walking',
    'Working with Hindrances',
    'Daily Mindfulness',
  ] as TipCategory[],
  eventTypes: [
    'Retreat Course',
    'Group Sitting',
    'Dhamma Talk',
    'Study Circle',
  ] as EventType[],
  eventStatuses: [
    'Registration Open',
    'Drop-In Welcome',
    'Waitlist',
    'Completed',
  ] as EventStatus[],
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  formHeightOptions: [
    { label: 'Compact', px: 560 },
    { label: 'Standard', px: 760 },
    { label: 'Tall', px: 960 },
  ],
};

export const STORAGE_KEYS = {
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
} as const;
