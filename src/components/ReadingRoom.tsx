import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Download,
  Moon,
  Pencil,
  Sun,
  Trash2,
} from 'lucide-react';
import { DhammaDiscourse, ReaderPreferences } from '../types/dhamma';
import { calculateEstimatedReadingMinutes } from '../utils/storageAndExport';
import { ArchivalImage } from './ArchivalImage';
import { DiscourseMediaBlock } from './DiscourseMediaBlock';

interface ReadingRoomProps {
  discourse: DhammaDiscourse;
  allDiscourses: DhammaDiscourse[];
  isBookmarked: boolean;
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
  isBookmarked,
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
  const articleRef = useRef<HTMLElement>(null);
  const estimatedMinutes = calculateEstimatedReadingMinutes(discourse);

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
      const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollableDistance) * 100)));
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
        className="sticky top-[117px] md:top-[69px] z-20 w-full bg-[#FBF9F5]/95 dark:bg-[#181512]/95 border-b border-[#E5DFD3] dark:border-[#342E28] backdrop-blur-sm"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 py-1.5 flex items-center justify-between gap-4 text-[11px] font-mono-code text-[#78716C] dark:text-[#A8A29E]">
          <span className="truncate">{discourse.accessionCode} · {discourse.title}</span>
          <span className="shrink-0 tabular-nums text-[#9A3412] dark:text-[#FDBA74]">
            {scrollProgress}% read
          </span>
        </div>
        <div className="h-[3px] w-full bg-[#E5DFD3] dark:bg-[#342E28]">
          <div
            className="h-full bg-[#9A3412] dark:bg-[#FDBA74] transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Reading Utility Toolbar */}
      <div className="border-b border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/60 dark:bg-[#1E1A16]">
        <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 min-h-[40px] text-xs font-medium text-[#44403C] dark:text-[#D6D3D1] hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Discourse Index</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Font size selector */}
            <div
              role="group"
              aria-label="Reading text size"
              className="flex items-center border border-[#D6CEBE] dark:border-[#44403C]"
            >
              {(['small', 'standard', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onUpdatePrefs({ ...prefs, fontSize: sz })}
                  className={`min-h-[36px] px-2.5 text-xs capitalize cursor-pointer transition-colors ${
                    prefs.fontSize === sz
                      ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                      : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onUpdatePrefs({ ...prefs, darkMode: !prefs.darkMode })}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#9A3412] cursor-pointer whitespace-nowrap shrink-0"
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
                  ? 'border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] dark:border-[#B45309] dark:bg-[#B45309]'
                  : 'border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#9A3412]'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => onExportMarkdown(discourse)}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#9A3412] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export .md</span>
            </button>

            <button
              type="button"
              onClick={() => onEditDiscourse(discourse)}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#9A3412] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit Content &amp; Media</span>
            </button>

            {discourse.isUserCreated && (
              <>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#9A3412] dark:text-[#FCA5A5] hover:border-[#9A3412] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDeleteDiscourse(discourse.id)}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs bg-[#9A3412] text-[#FBF9F5] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Confirm Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Reading Canvas: 70% Essay Column / 30% Margin Notes Rail */}
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8 sm:py-16">
        {/* Title & Accession Masthead */}
        <header className="max-w-3xl space-y-4 pb-10 border-b border-[#E5DFD3] dark:border-[#342E28]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
            <span className="font-mono-code text-[#9A3412] dark:text-[#FDBA74]">
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

          <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-[1.15] text-[#1C1917] dark:text-[#F5F5F4] text-balance">
            {discourse.title}
          </h1>

          {discourse.chineseTitle && (
            <p className="text-lg sm:text-xl font-medium text-[#44403C] dark:text-[#D6D3D1]">
              {discourse.chineseTitle}
            </p>
          )}

          {discourse.paliSubtitle && (
            <p className="font-serif italic text-base text-[#78716C] dark:text-[#A8A29E]">
              {discourse.paliSubtitle}
            </p>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#44403C] dark:text-[#D6D3D1]">
            <button
              type="button"
              onClick={() => onFilterBySayadaw(discourse.sayadawId)}
              title={`Index all discourses by ${discourse.sayadawName}`}
              className="font-semibold text-[#1C1917] dark:text-[#F5F5F4] hover:text-[#9A3412] dark:hover:text-[#FDBA74] hover:underline underline-offset-4 cursor-pointer"
            >
              {discourse.sayadawName}
            </button>
            <span aria-hidden="true" className="text-[#A8A29E]">
              ·
            </span>
            <span>{discourse.dateRecorded}</span>
            <span aria-hidden="true" className="text-[#A8A29E]">
              ·
            </span>
            <span>{discourse.sourceText}</span>
          </div>
        </header>

        <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* 70% Reading Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10 max-w-2xl">
            {discourse.coverImage && (
              <ArchivalImage
                src={discourse.coverImage}
                alt={discourse.title}
                caption={discourse.coverCaption || `Archival Plate — ${discourse.sourceText}`}
                aspectClassName="aspect-[16/10]"
              />
            )}

            {/* Summary Lead */}
            <p className="text-lg leading-relaxed text-[#44403C] dark:text-[#D6D3D1] italic">
              {discourse.summary}
            </p>

            {/* Attached Media, Audio Talks, Video Embeds, Documents */}
            <DiscourseMediaBlock
              audioReferenceUrl={discourse.audioReferenceUrl}
              mediaItems={discourse.mediaItems}
              discourseTitle={discourse.title}
            />

            {/* Sections */}
            {discourse.sections.map((section, sIdx) => (
              <section key={section.heading} id={`section-${sIdx}`} className="space-y-6">
                <h2 className="font-display text-2xl sm:text-[1.75rem] font-semibold text-[#1C1917] dark:text-[#F5F5F4] pt-4">
                  {section.heading}
                </h2>

                {section.paliExcerpt && (
                  <div className="p-5 sm:p-6 bg-[#F4EFE6]/80 dark:bg-[#221E1A] border border-[#E5DFD3] dark:border-[#342E28] space-y-2">
                    <p className="text-xs uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
                      Pāli Text
                    </p>
                    <p className="font-serif italic text-base sm:text-lg text-[#1C1917] dark:text-[#F5F5F4] leading-relaxed">
                      “{section.paliExcerpt}”
                    </p>
                    {section.paliTranslation && (
                      <p className="text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed pt-1">
                        {section.paliTranslation}
                      </p>
                    )}
                  </div>
                )}

                <div className={`space-y-5 text-[#292524] dark:text-[#E7E5E4] ${proseSizeClass}`}>
                  {section.paragraphs.map((para, pIdx) => {
                    const isOpeningParagraph = sIdx === 0 && pIdx === 0;
                    return (
                      <p
                        key={pIdx}
                        className={
                          isOpeningParagraph
                            ? 'first-letter:text-5xl first-letter:font-display first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-[#9A3412] dark:first-letter:text-[#FDBA74]'
                            : ''
                        }
                      >
                        {para}
                      </p>
                    );
                  })}
                </div>

                {/* Insert Pull Quote cleanly after first section */}
                {sIdx === 0 && discourse.pullQuote && (
                  <blockquote className="my-10 py-8 border-t border-b border-[#D6CEBE] dark:border-[#44403C] text-center px-4">
                    <p className="font-display italic text-2xl sm:text-3xl leading-snug text-[#1C1917] dark:text-[#F5F5F4] text-balance">
                      “{discourse.pullQuote}”
                    </p>
                    <footer className="mt-3 text-xs tracking-wider uppercase text-[#78716C] dark:text-[#A8A29E]">
                      — {discourse.sayadawName}
                    </footer>
                  </blockquote>
                )}
              </section>
            ))}

            {/* Institutional Footnotes */}
            {discourse.footnotes.length > 0 && (
              <footer className="pt-8 mt-12 border-t border-[#E5DFD3] dark:border-[#342E28] space-y-3">
                <h3 className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
                  Archival Citations &amp; Footnotes
                </h3>
                <ol className="space-y-2 text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                  {discourse.footnotes.map((fn) => (
                    <li key={fn.index} className="flex gap-2.5">
                      <span className="font-mono-code text-[#9A3412] dark:text-[#FDBA74] tabular-nums">
                        [{fn.index}]
                      </span>
                      <span>{fn.text}</span>
                    </li>
                  ))}
                </ol>
              </footer>
            )}
          </div>

          {/* 30% Margin Notes & Chapter Rail (4 cols) */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-[90px]">
            {/* Section Jump Rail */}
            {discourse.sections.length > 1 && (
              <div className="p-5 border border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16] space-y-3">
                <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
                  Discourse Outline
                </p>
                <nav aria-label="Discourse sections" className="space-y-2">
                  {discourse.sections.map((sec, idx) => (
                    <a
                      key={sec.heading}
                      href={`#section-${idx}`}
                      className="block text-xs leading-relaxed text-[#44403C] dark:text-[#D6D3D1] hover:text-[#9A3412] dark:hover:text-[#FDBA74] transition-colors"
                    >
                      {sec.heading}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Margin Notes */}
            <div className="space-y-5">
              <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E] pb-2 border-b border-[#E5DFD3] dark:border-[#342E28]">
                Margin Glossary &amp; Notes
              </p>
              {discourse.marginNotes.length === 0 ? (
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                  No margin glosses recorded for this discourse.
                </p>
              ) : (
                <div className="space-y-6">
                  {discourse.marginNotes.map((note) => (
                    <div
                      key={note.id}
                      className="pb-5 border-b border-[#E5DFD3]/70 dark:border-[#342E28]/70 space-y-1.5"
                    >
                      <p className="font-mono-code text-[11px] text-[#9A3412] dark:text-[#FDBA74]">
                        {note.anchorLabel}
                      </p>
                      <p className="font-display text-lg font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                        {note.termPali}
                      </p>
                      <p className="text-xs leading-relaxed text-[#44403C] dark:text-[#D6D3D1]">
                        {note.noteText}
                      </p>
                      <p className="text-[11px] italic text-[#78716C] dark:text-[#A8A29E]">
                        {note.sourceCitation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repository File Metadata */}
            <div className="p-5 border border-[#E5DFD3] dark:border-[#342E28] space-y-3">
              <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
                GitHub Pages Source Path
              </p>
              <p className="font-mono-code text-xs break-all text-[#1C1917] dark:text-[#F5F5F4]">
                {discourse.repoPath}
              </p>
              <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                Export as Markdown with YAML frontmatter to commit directly into{' '}
                <span className="font-mono-code">theartofnoting/dhamma_content</span>.
              </p>
              <button
                type="button"
                onClick={() => onExportMarkdown(discourse)}
                className="w-full min-h-[40px] px-4 py-2 text-xs font-medium border border-[#1C1917] dark:border-[#E7E5E4] text-[#1C1917] dark:text-[#F5F5F4] hover:bg-[#1C1917] hover:text-[#FBF9F5] dark:hover:bg-[#F5F5F4] dark:hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                Download Discourse (.md)
              </button>
            </div>

            {/* Indexed Under Sayadaw */}
            <div className="p-5 border border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16] space-y-3">
              <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
                Sayadaw Index
              </p>
              <p className="font-display text-lg font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                {discourse.sayadawName}
              </p>
              {sameSayadawDiscourses.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-[#E5DFD3] dark:border-[#342E28]">
                  {sameSayadawDiscourses.map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => onSelectDiscourse(other.id)}
                      className="block text-left text-xs leading-relaxed text-[#44403C] dark:text-[#D6D3D1] hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer"
                    >
                      {other.accessionCode} · {other.title}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => onFilterBySayadaw(discourse.sayadawId)}
                className="text-xs font-medium text-[#9A3412] dark:text-[#FDBA74] hover:underline underline-offset-4 cursor-pointer"
              >
                View all discourses by this Sayadaw →
              </button>
            </div>

            {/* Next Discourse Link */}
            {nextDiscourse && nextDiscourse.id !== discourse.id && (
              <div className="pt-4 border-t border-[#E5DFD3] dark:border-[#342E28] space-y-2">
                <p className="text-xs uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
                  Continue Study
                </p>
                <button
                  type="button"
                  onClick={() => onSelectDiscourse(nextDiscourse.id)}
                  className="text-left font-display text-xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] hover:text-[#9A3412] dark:hover:text-[#FDBA74] transition-colors cursor-pointer"
                >
                  {nextDiscourse.title}
                </button>
                <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                  {nextDiscourse.sayadawName}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
