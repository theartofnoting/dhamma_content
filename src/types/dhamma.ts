export type TraditionCollection =
  | 'Abhidhamma'
  | 'Satipatthana & Vipassana'
  | 'Sutta Pitaka'
  | 'Visuddhimagga'
  | 'Monastic Talks';

export type DiscourseLanguage =
  | 'Pāli · English'
  | 'Pāli · 繁體中文 · English'
  | 'English'
  | '繁體中文';

export interface SayadawProfile {
  id: string;
  slug?: string;
  name: string;
  honorificTitle: string;
  chineseName?: string;
  monastery: string;
  location: string;
  lineage: string;
  years: string;
  biography: string;
  primaryTexts: string[];
  imageUrl?: string;
}

export interface MarginNote {
  id: string;
  anchorLabel: string;
  termPali: string;
  noteText: string;
  sourceCitation: string;
}

export interface DiscourseSection {
  heading: string;
  paragraphs: string[];
  paliExcerpt?: string;
  paliTranslation?: string;
}

export interface DiscourseFootnote {
  index: number;
  text: string;
}

export type DiscourseMediaType = 'image' | 'audio' | 'video' | 'document';

export interface DiscourseMediaItem {
  id: string;
  type: DiscourseMediaType;
  title: string;
  url: string;
  caption?: string;
}

export interface DhammaDiscourse {
  id: string;
  accessionCode: string;
  slug?: string;
  collectionSlug?: string;
  sourceFormat?: 'md' | 'rst';
  title: string;
  chineseTitle?: string;
  paliSubtitle?: string;
  sayadawId: string;
  sayadawName: string;
  collection: TraditionCollection;
  language: DiscourseLanguage;
  dateRecorded: string;
  readingMinutes: number;
  sourceText: string;
  summary: string;
  sections: DiscourseSection[];
  pullQuote: string;
  marginNotes: MarginNote[];
  footnotes: DiscourseFootnote[];
  audioReferenceUrl?: string;
  coverCaption?: string;
  mediaItems?: DiscourseMediaItem[];
  repoPath: string;
  featuredRank?: 'lead' | 'secondary';
  coverImage?: string;
  isUserCreated?: boolean;
}

export type TipCategory =
  | 'Breath & Anchor'
  | 'Posture & Walking'
  | 'Working with Hindrances'
  | 'Daily Mindfulness';

export interface MeditationTip {
  id: string;
  title: string;
  category: TipCategory;
  paliTerm?: string;
  durationHint: string;
  authorSayadaw: string;
  summary: string;
  guidance: string[];
  updatedAt: string;
  isUserCreated?: boolean;
}

export type EventType =
  | 'Retreat Course'
  | 'Group Sitting'
  | 'Dhamma Talk'
  | 'Study Circle';

export type EventStatus = 'Registration Open' | 'Waitlist' | 'Drop-In Welcome' | 'Completed';

export interface GroupEvent {
  id: string;
  title: string;
  eventType: EventType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  timeRange: string;
  locationOrLink: string;
  teacher: string;
  status: EventStatus;
  description: string;
  linkedFormTabId?: string;
  isUserCreated?: boolean;
}

export interface GoogleFormTab {
  id: string;
  label: string;
  description: string;
  rawUrl: string;
  embedUrl: string;
  heightPx: number;
  isDefault?: boolean;
}

export interface ReaderPreferences {
  fontSize: 'small' | 'standard' | 'large';
  darkMode: boolean;
}

export interface GitHubRepoInfo {
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  has_pages: boolean;
}

export interface GitHubContentEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  html_url: string;
}

export interface GitHubAuthUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface PublishedContentManifest {
  version: number;
  updatedAt: string;
  discourses: DhammaDiscourse[];
  customSayadaws: SayadawProfile[];
  tips: MeditationTip[];
  events: GroupEvent[];
  formTabs: GoogleFormTab[];
}

export type NavSection =
  | 'discourses'
  | 'sayadaws'
  | 'tips'
  | 'events'
  | 'forms'
  | 'reader'
  | 'github'
  | 'login';
