import { useEffect, useRef, useState } from 'react';
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
import { buildDiscoursePath } from '../plugins/urlRouter';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { THEME_CLASSES } from '../theme/uiClasses';
import { calculateEstimatedReadingMinutes } from '../tools/readingTime';
import { DhammaDiscourse, ReaderPreferences, SayadawProfile } from '../types/dhamma';
import { ArchivalImage } from './ArchivalImage';
import { DiscourseMediaBlock } from './DiscourseMediaBlock';

interface ReadingRoomProps {
  discourse: DhammaDiscourse;
  allDiscourses: DhammaDiscourse[];
  sayadaws: SayadawProfile[];
  isBookmarked: boolean;
  isOwner: boolean;
  prefs: ReaderPreferences;
  onUpdatePrefs: (prefs: ReaderPreferences) => void;
  onBackToCatalog: () => void;
  onSelectDiscourse: (id: string) => void;
  onFilterBySayadaw: (sayadawId: string) => void;
  onToggleBookmark: (id: string) => void;
  onExportMarkdown: (discourse: DhammaDiscourse) => void;
  onEditDiscourse: (discourse: DhammaDiscourse) => void;
  onDeleteDiscourse: (id: string) => void;
}

export function ReadingRoom({
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const estimatedMinutes = calculateEstimatedReadingMinutes(discourse);
  const canonicalPath = buildDiscoursePath(discourse, sayadaws);

  useEffect(() => {
    setConfirmDelete(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [discourse.id]);

  useEffect(() => {
    const handleScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleBottom = articleTop + el.offsetHeight - window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollableDistance = Math.max(1, Math.min(docHeight, articleBottom));
      const pct = Math.min(
        100,
        Math.max(0, Math.round((window.scrollY / scrollableDistance) * 100)),
      );
      setScrollProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [discourse.id]);

  const proseSizeClass =
    prefs.fontSize === 'small'
      ? 'text-[0.95rem] leading-[1.75]'
      : prefs.fontSize === 'large'
        ? 'text-[1.1875rem] leading-[1.85]'
        : 'text-[1.0625rem] leading-[1.8]';

  const currentIdx = allDiscourses.findIndex((d) => d.id === discourse.id);
  const nextDiscourse =
    currentIdx >= 0 && currentIdx < allDiscourses.length - 1
      ? allDiscourses[currentIdx + 1]
      : allDiscourses[0];
  const sameSayadawDiscourses = allDiscourses.filter(
    (d) => d.sayadawId === discourse.sayadawId && d.id !== discourse.id,
  );

  return (
    <article ref={articleRef} className="relative">
      {/* Visual Reading Progress Bar */}
      <div
        role="progressbar"
        aria-label="Discourse reading progress"
        aria-valuenow={scrollProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`sticky top-[117px] md:top-[69px] z-20 w-full bg-[var(--surface-canvas)]/95 border-b ${THEME_CLASSES.borderHairline} backdrop-blur-sm`}
      >
        <div
          className={`mx-auto max-w-[1200px] px-4 sm:px-8 py-1.5 flex items-center justify-between gap-4 text-[11px] font-mono-code ${THEME_CLASSES.inkSubtle}`}
        >
          <span className="truncate">
            {discourse.accessionCode} · {discourse.title}
          </span>
          <span className={`shrink-0 tabular-nums ${THEME_CLASSES.accentInk}`}>
            {scrollProgress}% read
          </span>
        </div>
        <div className="h-[3px] w-full bg-[var(--border-hairline)]">
          <div
            className="h-full bg-[var(--accent-ink)] transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Reading Utility Toolbar */}
      <div className={`border-b ${THEME_CLASSES.borderHairline} bg-[var(--surface-band)]`}>
        <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToCatalog}
            className={`inline-flex items-center gap-2 min-h-[40px] text-xs font-medium ${THEME_CLASSES.inkSecondary} hover:text-[var(--accent-ink)] cursor-pointer whitespace-nowrap shrink-0`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Discourse Index</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              role="group"
              aria-label="Reading text size"
              className={`flex items-center border ${THEME_CLASSES.borderStrong}`}
            >
              {(['small', 'standard', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onUpdatePrefs({ ...prefs, fontSize: sz })}
                  className={`min-h-[36px] px-2.5 text-xs capitalize cursor-pointer transition-colors ${
                    prefs.fontSize === sz
                      ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                      : `${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)]`
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onUpdatePrefs({ ...prefs, darkMode: !prefs.darkMode })}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)] cursor-pointer whitespace-nowrap shrink-0`}
            >
              {prefs.darkMode ? (
                <>
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Paper</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Night</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(discourse.id)}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border cursor-pointer whitespace-nowrap shrink-0 ${
                isBookmarked
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
                  : `${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)]`
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => onExportMarkdown(discourse)}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)] cursor-pointer whitespace-nowrap shrink-0`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export .md</span>
            </button>

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => onEditDiscourse(discourse)}
                  className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)] cursor-pointer whitespace-nowrap shrink-0`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit Content &amp; Media</span>
                </button>

                <ConfirmDeleteAction
                  variant="button"
                  isConfirming={confirmDelete}
                  onRequestConfirm={() => setConfirmDelete(true)}
                  onConfirm={() => onDeleteDiscourse(discourse.id)}
                  onCancel={() => setConfirmDelete(false)}
                  confirmLabel="Confirm Delete"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8 sm:py-16">
        <header className={`max-w-3xl space-y-4 pb-10 border-b ${THEME_CLASSES.borderHairline}`}>
          <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkSubtle}`}>
            <span className={`font-mono-code ${THEME_CLASSES.accentInk}`}>
              {discourse.accessionCode}
            </span>
            <span aria-hidden="true">·</span>
            <span>{discourse.collection}</span>
            <span aria-hidden="true">·</span>
            <span>{discourse.language}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span>{estimatedMinutes} min read</span>
            </span>
          </div>

          <h1
            className={`font-display text-3xl sm:text-5xl font-semibold leading-[1.15] ${THEME_CLASSES.inkPrimary} text-balance`}
          >
            {discourse.title}
          </h1>

          {discourse.chineseTitle && (
            <p className={`text-lg sm:text-xl font-medium ${THEME_CLASSES.inkSecondary}`}>
              {discourse.chineseTitle}
            </p>
          )}

          {discourse.paliSubtitle && (
            <p className={`font-serif italic text-base ${THEME_CLASSES.inkSubtle}`}>
              {discourse.paliSubtitle}
            </p>
          )}

          <div
            className={`pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${THEME_CLASSES.inkSecondary}`}
          >
            <button
              type="button"
              onClick={() => onFilterBySayadaw(discourse.sayadawId)}
              title={`Index all discourses by ${discourse.sayadawName}`}
              className={`font-semibold ${THEME_CLASSES.inkPrimary} hover:text-[var(--accent-ink)] hover:underline underline-offset-4 cursor-pointer`}
            >
              {discourse.sayadawName}
            </button>
            <span aria-hidden="true" className={THEME_CLASSES.inkSubtle}>
              ·
            </span>
            <span>{discourse.dateRecorded}</span>
            <span aria-hidden="true" className={THEME_CLASSES.inkSubtle}>
              ·
            </span>
            <span>{discourse.sourceText}</span>
          </div>
        </header>

        <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* 70% Reading Column */}
          <div className="lg:col-span-8 space-y-10 max-w-2xl">
            {discourse.coverImage && (
              <ArchivalImage
                src={discourse.coverImage}
                alt={discourse.title}
                caption={discourse.coverCaption || `Archival Plate — ${discourse.sourceText}`}
                aspectClassName="aspect-[16/10]"
              />
            )}

            <p className={`text-lg leading-relaxed ${THEME_CLASSES.inkSecondary} italic`}>
              {discourse.summary}
            </p>

            <DiscourseMediaBlock
              audioReferenceUrl={discourse.audioReferenceUrl}
              mediaItems={discourse.mediaItems}
              discourseTitle={discourse.title}
            />

            {discourse.sections.map((section, sIdx) => (
              <section key={section.heading} id={`section-${sIdx}`} className="space-y-6">
                <h2
                  className={`font-display text-2xl sm:text-[1.75rem] font-semibold ${THEME_CLASSES.inkPrimary} pt-4`}
                >
                  {section.heading}
                </h2>

                {section.paliExcerpt && (
                  <div
                    className={`p-5 sm:p-6 bg-[var(--surface-input)] border ${THEME_CLASSES.borderHairline} space-y-2`}
                  >
                    <p className={`text-xs uppercase tracking-widest ${THEME_CLASSES.inkSubtle}`}>
                      Pāli Text
                    </p>
                    <p
                      className={`font-serif italic text-base sm:text-lg ${THEME_CLASSES.inkPrimary} leading-relaxed`}
                    >
                      “{section.paliExcerpt}”
                    </p>
                    {section.paliTranslation && (
                      <p className={`text-sm ${THEME_CLASSES.inkMuted} leading-relaxed pt-1`}>
                        {section.paliTranslation}
                      </p>
                    )}
                  </div>
                )}

                <div className={`space-y-5 ${THEME_CLASSES.inkBody} ${proseSizeClass}`}>
                  {section.paragraphs.map((para, pIdx) => {
                    const isOpeningParagraph = sIdx === 0 && pIdx === 0;
                    return (
                      <p
                        key={pIdx}
                        className={
                          isOpeningParagraph
                            ? 'first-letter:text-5xl first-letter:font-display first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-[var(--accent-ink)]'
                            : ''
                        }
                      >
                        {para}
                      </p>
                    );
                  })}
                </div>

                {sIdx === 0 && discourse.pullQuote && (
                  <blockquote
                    className={`my-10 py-8 border-t border-b ${THEME_CLASSES.borderStrong} text-center px-4`}
                  >
                    <p
                      className={`font-display italic text-2xl sm:text-3xl leading-snug ${THEME_CLASSES.inkPrimary} text-balance`}
                    >
                      “{discourse.pullQuote}”
                    </p>
                    <footer
                      className={`mt-3 text-xs tracking-wider uppercase ${THEME_CLASSES.inkSubtle}`}
                    >
                      — {discourse.sayadawName}
                    </footer>
                  </blockquote>
                )}
              </section>
            ))}

            {discourse.footnotes.length > 0 && (
              <footer className={`pt-8 mt-12 border-t ${THEME_CLASSES.borderHairline} space-y-3`}>
                <h3 className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
                  Archival Citations &amp; Footnotes
                </h3>
                <ol className={`space-y-2 text-xs leading-relaxed ${THEME_CLASSES.inkMuted}`}>
                  {discourse.footnotes.map((fn) => (
                    <li key={fn.index} className="flex gap-2.5">
                      <span className={`font-mono-code ${THEME_CLASSES.accentInk} tabular-nums`}>
                        [{fn.index}]
                      </span>
                      <span>{fn.text}</span>
                    </li>
                  ))}
                </ol>
              </footer>
            )}
          </div>

          {/* 30% Margin Notes & Chapter Rail */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-[90px]">
            {discourse.sections.length > 1 && (
              <div className={`p-5 ${THEME_CLASSES.card} space-y-3`}>
                <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
                  Discourse Outline
                </p>
                <nav aria-label="Discourse sections" className="space-y-2">
                  {discourse.sections.map((sec, idx) => (
                    <a
                      key={sec.heading}
                      href={`#section-${idx}`}
                      className={`block text-xs leading-relaxed ${THEME_CLASSES.inkSecondary} hover:text-[var(--accent-ink)] transition-colors`}
                    >
                      {sec.heading}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className="space-y-5">
              <p
                className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle} pb-2 border-b ${THEME_CLASSES.borderHairline}`}
              >
                Margin Glossary &amp; Notes
              </p>
              {discourse.marginNotes.length === 0 ? (
                <p className={`text-xs ${THEME_CLASSES.inkSubtle}`}>
                  No margin glosses recorded for this discourse.
                </p>
              ) : (
                <div className="space-y-6">
                  {discourse.marginNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`pb-5 border-b ${THEME_CLASSES.borderHairline} space-y-1.5`}
                    >
                      <p className={`font-mono-code text-[11px] ${THEME_CLASSES.accentInk}`}>
                        {note.anchorLabel}
                      </p>
                      <p className={`font-display text-lg font-semibold ${THEME_CLASSES.inkPrimary}`}>
                        {note.termPali}
                      </p>
                      <p className={`text-xs leading-relaxed ${THEME_CLASSES.inkSecondary}`}>
                        {note.noteText}
                      </p>
                      <p className={`text-[11px] italic ${THEME_CLASSES.inkSubtle}`}>
                        {note.sourceCitation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Canonical Indexed URL & Export */}
            <div className={`p-5 border ${THEME_CLASSES.borderHairline} space-y-3`}>
              <div className="space-y-1">
                <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
                  Sayadaw Index Permalink
                </p>
                <p className={`font-mono-code text-xs break-all ${THEME_CLASSES.accentInk}`}>
                  {canonicalPath}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const fullUrl = `${window.location.origin}${canonicalPath}`;
                    await navigator.clipboard.writeText(fullUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 1800);
                  } catch {
                    // Ignore clipboard error
                  }
                }}
                className={`w-full inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
              >
                {copiedLink ? (
                  <>
                    <Check className={`h-3.5 w-3.5 ${THEME_CLASSES.successInk}`} />
                    <span>Permalink Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy Discourse URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onExportMarkdown(discourse)}
                className={`w-full min-h-[40px] px-4 py-2 text-xs font-medium border border-[var(--ink-primary)] ${THEME_CLASSES.inkPrimary} hover:bg-[var(--ink-primary)] hover:text-[var(--surface-canvas)] transition-colors cursor-pointer`}
              >
                Download Discourse (.md)
              </button>
            </div>

            {/* Indexed Under Sayadaw */}
            <div className={`p-5 ${THEME_CLASSES.card} space-y-3`}>
              <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
                Sayadaw Index
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
                View all discourses by this Sayadaw →
              </button>
            </div>

            {nextDiscourse && nextDiscourse.id !== discourse.id && (
              <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} space-y-2`}>
                <p className={`text-xs uppercase tracking-widest ${THEME_CLASSES.inkSubtle}`}>
                  Continue Study
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
