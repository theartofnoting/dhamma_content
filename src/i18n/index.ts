import { DEFAULT_LOCALE } from '../config/taxonomy';
import { SiteLocale } from '../types/dhamma';
import { enDictionary } from './locales/en';
import { myDictionary } from './locales/my';
import { viDictionary } from './locales/vi';
import { LocaleDictionary } from './types';

const DICTIONARIES: Record<SiteLocale, LocaleDictionary> = {
  vi: viDictionary,
  en: enDictionary,
  my: myDictionary,
};

export function isSupportedLocale(value: string | undefined | null): value is SiteLocale {
  return value === 'vi' || value === 'en' || value === 'my';
}

export function getLocaleDictionary(locale: SiteLocale = DEFAULT_LOCALE): LocaleDictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export type { LocaleDictionary };
