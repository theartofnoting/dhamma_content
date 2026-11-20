import { ArrowRight } from 'lucide-react';
import { GITHUB_CONFIG, SITE_CONFIG } from '../config/siteConfig';
import { LocaleDictionary } from '../i18n';
import { THEME_CLASSES } from '../theme/uiClasses';
import { SiteLocale } from '../types/dhamma';
import { ArchivalImage } from './ArchivalImage';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeroSectionProps {
  locale: SiteLocale;
  dict: LocaleDictionary;
  totalDiscourses: number;
  totalSayadaws: number;
  totalTips: number;
  totalEvents: number;
  isOwner: boolean;
  onSelectLocale: (locale: SiteLocale) => void;
  onEnterReadingRoom: () => void;
  onExploreEvents: () => void;
  onOpenGitHubStudio: () => void;
}

export function HeroSection({
  locale,
  dict,
  totalDiscourses,
  totalSayadaws,
  totalTips,
  totalEvents,
  isOwner,
  onSelectLocale,
  onEnterReadingRoom,
  onExploreEvents,
  onOpenGitHubStudio,
}: HeroSectionProps) {
  return (
    <section className={`border-b ${THEME_CLASSES.borderHairline}`}>
      <div className="border-b border-[var(--border-hairline)] bg-[var(--surface-band)]">
        <div className="mx-auto max-w-[1200px] px-4 py-2.5 sm:px-8 flex flex-wrap items-center justify-between gap-3">
          <p className={`text-xs ${THEME_CLASSES.inkMuted} font-mono-code`}>
            {dict.hero.utilityNote} · {GITHUB_CONFIG.pagesHost}
          </p>
          <LanguageSwitcher
            locale={locale}
            dict={dict}
            onSelectLocale={onSelectLocale}
            align="right"
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-10 sm:px-8 sm:pt-12 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle} font-mono-code`}>
                {dict.hero.kicker}
              </p>
              <h1
                className={`font-display text-3xl sm:text-5xl font-semibold leading-[1.12] tracking-tight ${THEME_CLASSES.inkPrimary} text-balance`}
              >
                {dict.hero.headline}
              </h1>
              <p className={`text-base sm:text-lg leading-relaxed ${THEME_CLASSES.inkSecondary} max-w-xl`}>
                {dict.hero.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onEnterReadingRoom}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-medium bg-[var(--ink-primary)] text-[var(--surface-canvas)] hover:bg-[var(--accent-primary)] hover:text-[var(--accent-contrast)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
              >
                <span>
                  {totalDiscourses > 0 ? dict.hero.openReadingRoom : dict.hero.browseArchive}
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onExploreEvents}
                className={`inline-flex items-center min-h-[44px] px-5 py-2.5 text-sm font-medium ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} hover:border-[var(--accent-ink)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]`}
              >
                {dict.hero.upcomingCourses}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <ArchivalImage
              src={SITE_CONFIG.heroImage}
              alt={dict.hero.imageAlt}
              caption={dict.hero.imageCaption}
              aspectClassName="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[260px]"
              className="h-full"
            />
          </div>
        </div>

        <dl
          className={`mt-10 pt-8 border-t ${THEME_CLASSES.borderHairline} grid grid-cols-2 lg:grid-cols-4 gap-6`}
        >
          <div className="space-y-1">
            <dt className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
              {dict.hero.kpiDiscoursesLabel}
            </dt>
            <dd className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary} tabular-nums`}>
              {totalDiscourses}{' '}
              <span className={`text-sm font-sans font-normal ${THEME_CLASSES.inkMuted}`}>
                {dict.hero.kpiDiscoursesValueSuffix}
              </span>
            </dd>
          </div>
          <div className="space-y-1">
            <dt className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
              {dict.hero.kpiSayadawsLabel}
            </dt>
            <dd className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary} tabular-nums`}>
              {totalSayadaws}{' '}
              <span className={`text-sm font-sans font-normal ${THEME_CLASSES.inkMuted}`}>
                {dict.hero.kpiSayadawsValueSuffix}
              </span>
            </dd>
          </div>
          <div className="space-y-1">
            <dt className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
              {dict.hero.kpiTipsLabel}
            </dt>
            <dd className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary} tabular-nums`}>
              {totalTips}{' '}
              <span className={`text-sm font-sans font-normal ${THEME_CLASSES.inkMuted}`}>
                {dict.hero.kpiTipsValueSuffix}
              </span>
            </dd>
          </div>
          <div className="space-y-1">
            <dt className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
              {dict.hero.kpiEventsLabel}
            </dt>
            <dd className="flex items-baseline justify-between gap-2">
              <span className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary} tabular-nums`}>
                {totalEvents}{' '}
                <span className={`text-sm font-sans font-normal ${THEME_CLASSES.inkMuted}`}>
                  {dict.hero.kpiEventsValueSuffix}
                </span>
              </span>
              {isOwner && (
                <button
                  type="button"
                  onClick={onOpenGitHubStudio}
                  className={`text-xs font-medium ${THEME_CLASSES.accentInk} hover:underline underline-offset-4 cursor-pointer whitespace-nowrap`}
                >
                  {dict.hero.kpiGithubAction}
                </button>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
