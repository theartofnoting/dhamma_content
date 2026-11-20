import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Clock,
  Copy,
  Download,
  Moon,
  Pencil,
  Sun,
} from 'lucide-react';
import { LocaleDictionary } from '../i18n';
import { buildDiscoursePath } from '../plugins/urlRouter';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { THEME_CLASSES } from '../theme/uiClasses';
import { calculateEstimatedReadingMinutes } from '../tools/readingTime';
import {
  DhammaDiscourse,
  ReaderPreferences,
  SayadawProfile,
  SiteLocale,
} from '../types/dhamma';
import { ArchivalImage } from './ArchivalImage';
import { DiscourseMediaBlock } from './DiscourseMediaBlock';

interface ReadingRoomProps {
  locale: SiteLocale;
  dict: LocaleDictionary;
  discourse: DhammaDiscourse;
  allDiscourses: DhammaDiscourse[];
  sayadaws: SayadawProfile[];
  isBookmarked: boolean;
  isOwner: boolean;
  prefs: ReaderPreferences;
  onUpdatePrefs: (next: ReaderPreferences) => void;
  onBackToCatalog: () => void;
  onSelectDiscourse: (id: string) => void;
  onFilterBySayadaw: (sayadawId: string) => void;
  onToggleBookmark: (id: string) => void;
  onExportMarkdown: (discourse: DhammaDiscourse) => void;
  onEditDiscourse: (discourse: DhammaDiscourse) => void;
  onDeleteDiscourse: (id: string) => void;
}

const FONT_SIZE_CLASSES: Record<ReaderPreferences['fontSize'], string> = {
  small: 'text-[15px] leading-[1.72]',
  standard: 'text-[17px] leading-[1.8]',
  large: 'text-[19px] leading-[1.85]',
};

export function ReadingRoom({
  locale,
  dict,
  discourse,
  allDiscourses,
  sayadaws,
  isBookmarked,
  isOwner,
  prefs,
  onUpdatePrefs,
  onBackToCatalog,
  onSelectDiscourse,
  onFilterBySayadaw,
  onToggleBookmark,
  onExportMarkdown,
  onEditDiscourse,
  onDeleteDiscourse,
}: ReadingRoomProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const estimatedMinutes = useMemo(
    () => calculateEstimatedReadingMinutes(discourse),
    [discourse],
  );
  const canonicalPath = useMemo(
    () => buildDiscoursePath(discourse, sayadaws, locale),
    [discourse, sayadaws, locale],
  );

  const sameSayadawDiscourses = allDiscourses.filter(
    (d) => d.sayadawId === discourse.sayadawId && d.id !== discourse.id,
  );
  const nextDiscourse =
    sameSayadawDiscourses[0] || allDiscourses.find((d) => d.id !== discourse.id);

  const proseSizeClass = FONT_SIZE_CLASSES[prefs.fontSize];

  const handleCopyPermalink = async () => {
    try {
      const fullUrl = `${window.location.origin}${canonicalPath}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <article className="pb-20">
      <div className={`border-b ${THEME_CLASSES.borderHairline} bg-[var(--surface-band)]`}>
        <div className="mx-auto max-w-[1200px] px-4 py-3.5 sm:px-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToCatalog}
            className={`inline-flex items-center gap-2 text-xs font-medium ${THEME_CLASSES.inkPrimary} hover:text-[var(--accent-ink)] transition-colors cursor-pointer`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{dict.readingRoom.backToIndex}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center border ${THEME_CLASSES.borderStrong}`}
              role="group"
              aria-label={dict.readingRoom.textSizeLabel}
            >
              {(['small', 'standard', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onUpdatePrefs({ ...prefs, fontSize: sz })}
                  className={`min-h-[34px] px-2.5 text-xs font-medium transition-colors cursor-pointer ${
                    prefs.fontSize === sz
                      ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                      : `${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)]`
                  }`}
                >
                  {sz === 'small' ? 'A-' : sz === 'standard' ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onUpdatePrefs({ ...prefs, darkMode: !prefs.darkMode })}
              className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
            >
              {prefs.darkMode ? (
                <>
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{dict.readingRoom.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{dict.readingRoom.darkMode}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(discourse.id)}
              className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 text-xs font-medium border cursor-pointer ${
                isBookmarked
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-[var(--accent-primary)]'
                  : `${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)]`
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isBookmarked ? dict.readingRoom.saved : dict.readingRoom.save}</span>
            </button>

            <button
              type="button"
              onClick={() => onExportMarkdown(discourse)}
              className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.readingRoom.exportMd}</span>
            </button>

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => onEditDiscourse(discourse)}
                  className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{dict.readingRoom.edit}</span>
                </button>
                <ConfirmDeleteAction
                  isConfirming={confirmDelete}
                  onRequestConfirm={() => setConfirmDelete(true)}
                  onConfirm={() => {
                    onDeleteDiscourse(discourse.id);
                    setConfirmDelete(false);
                  }}
                  onCancel={() => setConfirmDelete(false)}
                  ariaLabel={`Delete ${discourse.title}`}
                  confirmLabel={dict.catalog.confirmDelete}
                  cancelLabel={dict.sayadaws.cancelBtn}
                  variant="button"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-8 sm:pt-14">
        <header className={`pb-8 border-b ${THEME_CLASSES.borderHairline} space-y-4 max-w-4xl`}>
          <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkMuted}`}>
            <span className={`font-mono-code font-medium ${THEME_CLASSES.accentInk}`}>
              {discourse.accessionCode}
            </span>
            <span aria-hidden="true">·</span>
            <span>{dict.taxonomyLabels.collections[discourse.collection]}</span>
            <span aria-hidden="true">·</span>
            <span>{discourse.language}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {estimatedMinutes} {dict.catalog.minReadSuffix}
            </span>
          </div>

          <h1
            className={`font-display text-3xl sm:text-5xl font-semibold leading-[1.12] tracking-tight ${THEME_CLASSES.inkPrimary} text-balance`}
          >
            {discourse.title}
          </h1>

          {discourse.vietnameseTitle && (
            <p className={`font-display text-xl sm:text-2xl ${THEME_CLASSES.inkSecondary}`}>
              {discourse.vietnameseTitle}
            </p>
          )}

          {discourse.paliSubtitle && (
            <p className={`text-sm sm:text-base italic ${THEME_CLASSES.inkMuted}`}>
              {discourse.paliSubtitle}
            </p>
          )}

          <p className={`text-sm ${THEME_CLASSES.inkSecondary} pt-1`}>
            <button
              type="button"
              onClick={() => onFilterBySayadaw(discourse.sayadawId)}
              className={`font-medium ${THEME_CLASSES.inkPrimary} hover:text-[var(--accent-ink)] hover:underline underline-offset-4 cursor-pointer`}
            >
              {discourse.sayadawName}
            </button>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>{discourse.sourceText}</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span className="tabular-nums">{discourse.dateRecorded}</span>
          </p>
        </header>

        <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-8 space-y-10 max-w-[68ch]">
            {discourse.coverImage && (
              <ArchivalImage
                src={discourse.coverImage}
                alt={discourse.title}
                caption={discourse.coverCaption}
                aspectClassName="aspect-[16/9]"
              />
            )}

            <DiscourseMediaBlock
              audioReferenceUrl={discourse.audioReferenceUrl}
              mediaItems={discourse.mediaItems}
              discourseTitle={discourse.title}
              headingLabel={dict.readingRoom.recordingsTitle}
            />

            <p className={`text-lg leading-relaxed ${THEME_CLASSES.inkBody} font-medium`}>
              {discourse.summary}
            </p>

            <blockquote className="py-6 border-y border-[var(--border-hairline)]">
              <p
                className={`font-display text-2xl sm:text-3xl italic leading-snug ${THEME_CLASSES.inkPrimary} text-balance`}
              >
                “{discourse.pullQuote}”
              </p>
            </blockquote>

            {discourse.sections.map((section, idx) => (
              <section key={`${section.heading}-${idx}`} className="space-y-4">
                <h2
                  className={`font-display text-2xl sm:text-3xl font-semibold ${THEME_CLASSES.inkPrimary} pt-2`}
                >
                  {section.heading}
                </h2>

                {section.paliExcerpt && (
                  <div className={`p-5 ${THEME_CLASSES.card} space-y-2`}>
                    <p
                      className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle} font-mono-code`}
                    >
                      {dict.readingRoom.paliLabel}
                    </p>
                    <p className={`text-base italic leading-relaxed ${THEME_CLASSES.inkPrimary}`}>
                      {section.paliExcerpt}
                    </p>
                    {section.paliTranslation && (
                      <p className={`text-sm leading-relaxed ${THEME_CLASSES.inkMuted}`}>
                        — {section.paliTranslation}
                      </p>
                    )}
                  </div>
                )}

                {section.paragraphs.map((paragraph, pIdx) => {
                  const isLeadParagraph = idx === 0 && pIdx === 0;
                  return (
                    <p
                      key={pIdx}
                      className={`${proseSizeClass} ${THEME_CLASSES.inkBody} ${
                        isLeadParagraph
                          ? 'first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none'
                          : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </section>
            ))}

            {discourse.footnotes.length > 0 && (
              <section className={`pt-8 border-t ${THEME_CLASSES.borderHairline} space-y-3`}>
                <h2 className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
                  {dict.readingRoom.footnotesTitle}
                </h2>
                <ol className={`space-y-2 text-xs leading-relaxed ${THEME_CLASSES.inkMuted}`}>
                  {discourse.footnotes.map((fn) => (
                    <li key={fn.index} className="flex gap-2.5 tabular-nums">
                      <span className={`font-mono-code ${THEME_CLASSES.accentInk}`}>
                        [{fn.index}]
                      </span>
                      <span>{fn.text}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {discourse.marginNotes.length > 0 && (
              <div className={`p-5 ${THEME_CLASSES.card} space-y-4`}>
                <h2 className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
                  {dict.readingRoom.marginGlossaryTitle}
                </h2>
                <div className={THEME_CLASSES.divideHairline}>
                  {discourse.marginNotes.map((note) => (
                    <div key={note.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <p className={`font-display text-lg font-semibold ${THEME_CLASSES.inkPrimary}`}>
                        {note.termPali}{' '}
                        <span className={`text-xs font-sans font-normal ${THEME_CLASSES.inkSubtle}`}>
                          · {note.anchorLabel}
                        </span>
                      </p>
                      <p className={`text-xs leading-relaxed ${THEME_CLASSES.inkSecondary}`}>
                        {note.noteText}
                      </p>
                      <p className={`text-[11px] font-mono-code ${THEME_CLASSES.inkSubtle}`}>
                        {note.sourceCitation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`p-5 border ${THEME_CLASSES.borderHairline} space-y-3`}>
              <div className="space-y-1">
                <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
                  {dict.readingRoom.permalinkTitle}
                </p>
                <p className={`font-mono-code text-xs break-all ${THEME_CLASSES.accentInk}`}>
                  {canonicalPath}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyPermalink}
                className={`w-full inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
              >
                {copiedLink ? (
                  <>
                    <Check className={`h-3.5 w-3.5 ${THEME_CLASSES.successInk}`} />
                    <span>{dict.readingRoom.copiedUrl}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{dict.readingRoom.copyUrl}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onExportMarkdown(discourse)}
                className={`w-full min-h-[40px] px-4 py-2 text-xs font-medium border border-[var(--ink-primary)] ${THEME_CLASSES.inkPrimary} hover:bg-[var(--ink-primary)] hover:text-[var(--surface-canvas)] transition-colors cursor-pointer`}
              >
                {dict.readingRoom.exportMd}
              </button>
            </div>

            <div className={`p-5 ${THEME_CLASSES.card} space-y-3`}>
              <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
                {dict.readingRoom.sayadawIndexTitle}
              </p>
              <p className={`font-display text-lg font-semibold ${THEME_CLASSES.inkPrimary}`}>
                {discourse.sayadawName}
              </p>
              {sameSayadawDiscourses.length > 0 && (
                <div className={`space-y-2 pt-1 border-t ${THEME_CLASSES.borderHairline}`}>
                  {sameSayadawDiscourses.map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => onSelectDiscourse(other.id)}
                      className={`block text-left text-xs leading-relaxed ${THEME_CLASSES.inkSecondary} hover:text-[var(--accent-ink)] cursor-pointer`}
                    >
                      {other.accessionCode} · {other.title}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => onFilterBySayadaw(discourse.sayadawId)}
                className={`text-xs font-medium ${THEME_CLASSES.accentInk} hover:underline underline-offset-4 cursor-pointer`}
              >
                {dict.readingRoom.viewAllBySayadaw}
              </button>
            </div>

            {nextDiscourse && nextDiscourse.id !== discourse.id && (
              <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} space-y-2`}>
                <p className={`text-xs uppercase tracking-widest ${THEME_CLASSES.inkSubtle}`}>
                  {dict.readingRoom.continueStudy}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectDiscourse(nextDiscourse.id)}
                  className={`text-left font-display text-xl font-semibold ${THEME_CLASSES.inkPrimary} hover:text-[var(--accent-ink)] transition-colors cursor-pointer`}
                >
                  {nextDiscourse.title}
                </button>
                <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>{nextDiscourse.sayadawName}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
