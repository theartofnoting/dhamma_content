export const SITE_LOCALES = ['vi', 'en', 'my'] as const;

export const DEFAULT_LOCALE = 'vi' as const;

export const TRADITION_COLLECTIONS = [
  'Abhidhamma',
  'Satipatthana & Vipassana',
  'Sutta Pitaka',
  'Visuddhimagga',
  'Monastic Talks',
] as const;

export const DISCOURSE_LANGUAGES = [
  'Pāli · Vietnamese · English',
  'Pāli · English',
  'Vietnamese',
  'English',
] as const;

export const TIP_CATEGORIES = [
  'Breath & Anchor',
  'Posture & Walking',
  'Working with Hindrances',
  'Daily Mindfulness',
] as const;

export const EVENT_TYPES = [
  'Retreat Course',
  'Group Sitting',
  'Dhamma Talk',
  'Study Circle',
] as const;

export const EVENT_STATUSES = [
  'Registration Open',
  'Drop-In Welcome',
  'Waitlist',
  'Completed',
] as const;

export const COLLECTION_PREFIXES: Record<(typeof TRADITION_COLLECTIONS)[number], string> = {
  Abhidhamma: 'ABH',
  'Satipatthana & Vipassana': 'VIP',
  'Sutta Pitaka': 'SUT',
  Visuddhimagga: 'VIS',
  'Monastic Talks': 'MNK',
};
