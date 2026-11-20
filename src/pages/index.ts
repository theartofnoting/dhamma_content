import { ComponentType } from 'react';
import { SiteLocale } from '../types/dhamma';
import { BurmesePage } from './BurmesePage';
import { EnglishPage } from './EnglishPage';
import { LocalizedPageProps } from './LocalizedArchivePage';
import { VietnamesePage } from './VietnamesePage';

export const LOCALIZED_PAGE_COMPONENTS: Record<SiteLocale, ComponentType<LocalizedPageProps>> = {
  vi: VietnamesePage,
  en: EnglishPage,
  my: BurmesePage,
};

export { VietnamesePage, EnglishPage, BurmesePage };
