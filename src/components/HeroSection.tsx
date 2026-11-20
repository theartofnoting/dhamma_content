import { ArrowRight } from 'lucide-react';
import { GITHUB_CONFIG, SITE_CONFIG } from '../config/siteConfig';
import { THEME_CLASSES } from '../theme/uiClasses';
import { ArchivalImage } from './ArchivalImage';

interface HeroSectionProps {
  totalDiscourses: number;
  totalTips: number;
  totalEvents: number;
  isOwner: boolean;
  onEnterReadingRoom: () => void;
  onExploreEvents: () => void;
  onOpenGitHubStudio: () => void;
}

export function HeroSection({
  totalDiscourses,
  totalTips,
  totalEvents,
  isOwner,
  onEnterReadingRoom,
  onExploreEvents,
  onOpenGitHubStudio,
}: HeroSectionProps) {
  return (
    <section className={`border-b ${THEME_CLASSES.borderHairline}`}>
      <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-10 sm:px-8 sm:pt-14 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle} font-mono-code`}>
                {SITE_CONFIG.heroKicker}
              </p>

              <h1
                className={`font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-semibold leading-[1.12] tracking-tight ${THEME_CLASSES.inkPrimary} text-balance`}
              >
                {SITE_CONFIG.heroHeadline}
              </h1>

              <p className={`text-base sm:text-[1.0625rem] leading-[1.7] ${THEME_CLASSES.inkSecondary} max-w-xl`}>
                {SITE_CONFIG.heroDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onEnterReadingRoom}
                className="inline-flex items-center gap-2.5 min-h-[44px] px-6 py-2.5 text-sm font-medium bg-[var(--ink-primary)] text-[var(--surface-canvas)] hover:opacity-90 transition-opacity duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
              >
                <span>{totalDiscourses > 0 ? 'Open Reading Room' : 'Browse Archive'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreEvents}
                className={`inline-flex items-center min-h-[44px] px-5 py-2.5 text-sm font-medium ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} hover:border-[var(--accent-ink)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]`}
              >
                Upcoming Courses &amp; Events
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <ArchivalImage
              src={SITE_CONFIG.heroImage}
              alt={SITE_CONFIG.heroImageAlt}
              caption={SITE_CONFIG.heroImageCaption}
              aspectClassName="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[260px]"
              className="h-full"
            />
          </div>
        </div>

        <div className={`mt-10 pt-8 border-t ${THEME_CLASSES.borderHairline} grid grid-cols-2 lg:grid-cols-4 gap-6`}>
          <div>
            <dt className={`text-xs tracking-wider uppercase ${THEME_CLASSES.inkSubtle}`}>
              Sayadaw Discourses
            </dt>
            <dd className={`mt-1 font-display text-3xl font-semibold ${THEME_CLASSES.inkPrimary} tabular-nums`}>
              {totalDiscourses}
            </dd>
          </div>
          <div>
            <dt className={`text-xs tracking-wider uppercase ${THEME_CLASSES.inkSubtle}`}>
              Meditation Tips
            </dt>
            <dd className={`mt-1 font-display text-3xl font-semibold ${THEME_CLASSES.inkPrimary} tabular-nums`}>
              {totalTips}
            </dd>
          </div>
          <div>
            <dt className={`text-xs tracking-wider uppercase ${THEME_CLASSES.inkSubtle}`}>
              Scheduled Courses
            </dt>
            <dd className={`mt-1 font-display text-3xl font-semibold ${THEME_CLASSES.inkPrimary} tabular-nums`}>
              {totalEvents}
            </dd>
          </div>
          <div>
            <dt className={`text-xs tracking-wider uppercase ${THEME_CLASSES.inkSubtle}`}>
              {isOwner ? 'Archive Publishing' : 'Open Dhamma Archive'}
            </dt>
            <dd className="mt-1.5">
              {isOwner ? (
                <button
                  type="button"
                  onClick={onOpenGitHubStudio}
                  className={`font-mono-code text-sm ${THEME_CLASSES.accentInk} hover:underline underline-offset-4 cursor-pointer text-left break-all`}
                >
                  {GITHUB_CONFIG.pagesHost}
                </button>
              ) : (
                <a
                  href={GITHUB_CONFIG.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-mono-code text-sm ${THEME_CLASSES.accentInk} hover:underline underline-offset-4 text-left break-all`}
                >
                  {GITHUB_CONFIG.pagesHost}
                </a>
              )}
            </dd>
          </div>
        </div>
      </div>
    </section>
  );
}
