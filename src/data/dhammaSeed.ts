import { DhammaDiscourse, SayadawProfile } from '../types/dhamma';

const BASE = import.meta.env.BASE_URL;

export const HERO_LIBRARY_IMAGE = `${BASE}src/assets/images/hero_monastery_library_1795114132971.jpg`;

// Sayadaws and discourses are loaded exclusively from content/ (content/archive.json + content/articles/)
// so the displayed catalog matches the GitHub repository 1-to-1.
export const SAYADAW_PROFILES: SayadawProfile[] = [];

export const INITIAL_DISCOURSES: DhammaDiscourse[] = [];
