import { Clock, Headphones } from 'lucide-react';
import { LocaleDictionary } from '../../i18n';
import { THEME_CLASSES } from '../../theme/uiClasses';
import { DhammaDiscourse } from '../../types/dhamma';
import { ArchivalImage } from '../ArchivalImage';

interface DiscourseFeatureCardsProps {
  dict: LocaleDictionary;
  leadDiscourse: DhammaDiscourse;
  secondaryDiscourses: DhammaDiscourse[];
  readingTimesById: Map<string, number>;
  bookmarks: string[];
  onSelectDiscourse: (id: string) => void;
  onSayadawChange: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onExportMarkdown: (discourse: DhammaDiscourse) => void;
}

export function DiscourseFeatureCards({
  dict,
  leadDiscourse,
  secondaryDiscourses,
  readingTimesById,
  bookmarks,
  onSelectDiscourse,
  onSayadawChange,
  onToggleBookmark,
  onExportMarkdown,
}: DiscourseFeatureCardsProps) {
  const leadHasMedia = Boolean(
    leadDiscourse.audioReferenceUrl ||
      (leadDiscourse.mediaItems && leadDiscourse.mediaItems.length > 0),
  );

  return (
    <div className="space-y-10 pb-10 border-b border-[var(--border-hairline)]">
      {/* Tier 1: Lead Discourse */}
      <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch pt-8">
        <div className="lg:col-span-6 flex flex-col justify-between gap-6">
          <div className="space-y-3.5">
            <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkMuted}`}>
              <span className={`font-mono-code font-medium ${THEME_CLASSES.accentInk}`}>
                {leadDiscourse.accessionCode}
              </span>
              <span aria-hidden="true">·</span>
              <span>{dict.catalog.leadStoryBadge}</span>
              <span aria-hidden="true">·</span>
              <span>{dict.taxonomyLabels.collections[leadDiscourse.collection]}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {readingTimesById.get(leadDiscourse.id) ?? leadDiscourse.readingMinutes}{' '}
                {dict.catalog.minReadSuffix}
              </span>
              {leadHasMedia && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className={`inline-flex items-center gap-1 ${THEME_CLASSES.accentInk}`}>
                    <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Media</span>
                  </span>
                </>
              )}
            </div>

            <h3
              className={`font-display text-3xl sm:text-4xl font-semibold leading-tight ${THEME_CLASSES.inkPrimary} text-balance`}
            >
              <button
                type="button"
                onClick={() => onSelectDiscourse(leadDiscourse.id)}
                className="text-left hover:text-[var(--accent-ink)] transition-colors cursor-pointer"
              >
                {leadDiscourse.title}
              </button>
            </h3>

            {leadDiscourse.vietnameseTitle && (
              <p className={`text-base font-medium ${THEME_CLASSES.inkSecondary}`}>
                {leadDiscourse.vietnameseTitle}
              </p>
            )}

            <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>
              <button
                type="button"
                onClick={() => onSayadawChange(leadDiscourse.sayadawId)}
                className={`font-medium ${THEME_CLASSES.inkBody} hover:text-[var(--accent-ink)] hover:underline underline-offset-4 cursor-pointer`}
              >
                {leadDiscourse.sayadawName}
              </button>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <span>{leadDiscourse.sourceText}</span>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <span>{leadDiscourse.language}</span>
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${THEME_CLASSES.inkSecondary}`}>
              {leadDiscourse.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onSelectDiscourse(leadDiscourse.id)}
              className={THEME_CLASSES.btnPrimary}
            >
              {dict.catalog.readDiscourse}
            </button>
            <button
              type="button"
              onClick={() => onToggleBookmark(leadDiscourse.id)}
              className={THEME_CLASSES.btnOutline}
            >
              {bookmarks.includes(leadDiscourse.id) ? dict.catalog.saved : dict.catalog.save}
            </button>
            <button
              type="button"
              onClick={() => onExportMarkdown(leadDiscourse)}
              className={`text-xs ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
            >
              {dict.catalog.exportMd}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <ArchivalImage
            src={leadDiscourse.coverImage}
            alt={leadDiscourse.title}
            caption={leadDiscourse.coverCaption}
            aspectClassName="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[240px]"
            className="h-full"
          />
        </div>
      </article>

      {/* Tier 2: Secondary Features */}
      {secondaryDiscourses.length > 0 && (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t ${THEME_CLASSES.borderHairline}`}
        >
          {secondaryDiscourses.map((d) => (
            <article key={d.id} className="flex flex-col justify-between gap-4">
              <div className="space-y-3">
                {d.coverImage && (
                  <ArchivalImage
                    src={d.coverImage}
                    alt={d.title}
                    aspectClassName="aspect-[16/9]"
                  />
                )}
                <div className="space-y-2">
                  <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkMuted}`}>
                    <span className={`font-mono-code ${THEME_CLASSES.accentInk}`}>
                      {d.accessionCode}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{dict.taxonomyLabels.collections[d.collection]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {readingTimesById.get(d.id) ?? d.readingMinutes} {dict.catalog.minReadSuffix}
                    </span>
                  </div>
                  <h3
                    className={`font-display text-2xl font-semibold leading-snug ${THEME_CLASSES.inkPrimary} text-balance`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectDiscourse(d.id)}
                      className="text-left hover:text-[var(--accent-ink)] transition-colors cursor-pointer"
                    >
                      {d.title}
                    </button>
                  </h3>
                  {d.vietnameseTitle && (
                    <p className={`text-sm font-medium ${THEME_CLASSES.inkMuted}`}>
                      {d.vietnameseTitle}
                    </p>
                  )}
                  <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>
                    <button
                      type="button"
                      onClick={() => onSayadawChange(d.sayadawId)}
                      className={`font-medium ${THEME_CLASSES.inkBody} hover:text-[var(--accent-ink)] hover:underline underline-offset-4 cursor-pointer`}
                    >
                      {d.sayadawName}
                    </button>
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span>{d.sourceText}</span>
                  </p>
                  <p className={`text-sm leading-relaxed ${THEME_CLASSES.inkSecondary}`}>
                    {d.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectDiscourse(d.id)}
                  className={`text-sm font-medium ${THEME_CLASSES.accentInk} hover:underline underline-offset-4 cursor-pointer`}
                >
                  {dict.catalog.readDiscourse}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleBookmark(d.id)}
                  className={`text-xs ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
                >
                  {bookmarks.includes(d.id) ? dict.catalog.saved : dict.catalog.save}
                </button>
                <button
                  type="button"
                  onClick={() => onExportMarkdown(d)}
                  className={`text-xs ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
                >
                  {dict.catalog.exportMd}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
