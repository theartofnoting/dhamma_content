import { useMemo, useState } from 'react';
import {
  Bookmark,
  Clock,
  Download,
  Headphones,
  Layers,
  Moon,
  Pencil,
  Plus,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { SECTION_IDS, TAXONOMY } from '../config/siteConfig';
import { buildDiscoursePath } from '../plugins/urlRouter';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { calculateEstimatedReadingMinutes } from '../tools/readingTime';
import {
  DhammaDiscourse,
  DiscourseLanguage,
  SayadawProfile,
  TraditionCollection,
} from '../types/dhamma';
import { ArchivalImage } from './ArchivalImage';

interface DiscourseCatalogProps {
  discourses: DhammaDiscourse[];
  sayadaws: SayadawProfile[];
  bookmarks: string[];
  isOwner: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCollection: TraditionCollection | 'All';
  onCollectionChange: (c: TraditionCollection | 'All') => void;
  selectedSayadawId: string;
  onSayadawChange: (id: string) => void;
  selectedLanguage: DiscourseLanguage | 'All';
  onLanguageChange: (lang: DiscourseLanguage | 'All') => void;
  onlySaved: boolean;
  onToggleOnlySaved: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectDiscourse: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onExportMarkdown: (discourse: DhammaDiscourse) => void;
  onEditDiscourse: (discourse: DhammaDiscourse) => void;
  onDeleteDiscourse: (id: string) => void;
  onOpenStoreModal: (presetSayadawId?: string) => void;
}

const COLLECTION_FILTERS: (TraditionCollection | 'All')[] = ['All', ...TAXONOMY.collections];
const LANGUAGE_FILTERS: (DiscourseLanguage | 'All')[] = ['All', ...TAXONOMY.languages];

interface CatalogueRowProps {
  discourse: DhammaDiscourse;
  sayadaws: SayadawProfile[];
  estMinutes: number;
  isSaved: boolean;
  isOwner: boolean;
  isConfirmingDelete: boolean;
  showSayadawColumn: boolean;
  onSelectDiscourse: (id: string) => void;
  onSayadawChange: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onExportMarkdown: (d: DhammaDiscourse) => void;
  onEditDiscourse: (d: DhammaDiscourse) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

function CatalogueRow({
  discourse: d,
  sayadaws,
  estMinutes,
  isSaved,
  isOwner,
  isConfirmingDelete,
  showSayadawColumn,
  onSelectDiscourse,
  onSayadawChange,
  onToggleBookmark,
  onExportMarkdown,
  onEditDiscourse,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: CatalogueRowProps) {
  const hasMedia = Boolean(d.audioReferenceUrl || (d.mediaItems && d.mediaItems.length > 0));

  return (
    <div
      className={`${showSayadawColumn ? 'py-5' : 'py-4'} grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-center hover:bg-[var(--surface-band)] transition-colors px-2 -mx-2`}
    >
      <div className="lg:col-span-2 flex items-center gap-2">
        <span className={`font-mono-code text-xs ${THEME_CLASSES.accentInk} tabular-nums`}>
          {d.accessionCode}
        </span>
      </div>

      <div className={`${showSayadawColumn ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-1`}>
        <button
          type="button"
          onClick={() => onSelectDiscourse(d.id)}
          className={`text-left font-display text-xl font-semibold ${THEME_CLASSES.inkPrimary} hover:text-[var(--accent-ink)] transition-colors cursor-pointer`}
        >
          {d.title}
        </button>
        <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkMuted}`}>
          {d.chineseTitle && <span>{d.chineseTitle}</span>}
          {d.chineseTitle && <span aria-hidden="true">·</span>}
          <span>{d.sourceText}</span>
        </div>
        {showSayadawColumn && (
          <p className={`font-mono-code text-[11px] ${THEME_CLASSES.inkSubtle} truncate`}>
            {buildDiscoursePath(d, sayadaws)}
          </p>
        )}
      </div>

      <div
        className={`${showSayadawColumn ? 'lg:col-span-3' : 'lg:col-span-2'} text-xs ${THEME_CLASSES.inkMuted} space-y-0.5`}
      >
        {showSayadawColumn && (
          <p>
            <button
              type="button"
              onClick={() => onSayadawChange(d.sayadawId)}
              className={`font-medium ${THEME_CLASSES.inkBody} hover:text-[var(--accent-ink)] hover:underline underline-offset-4 cursor-pointer text-left`}
            >
              {d.sayadawName}
            </button>
          </p>
        )}
        <p className="inline-flex flex-wrap items-center gap-1.5">
          <span>{d.collection}</span>
          <span aria-hidden="true">·</span>
          <span className={`inline-flex items-center gap-1 tabular-nums ${THEME_CLASSES.accentInk}`}>
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{estMinutes} {showSayadawColumn ? 'min read' : 'min'}</span>
          </span>
          {hasMedia && (
            <>
              <span aria-hidden="true">·</span>
              <span className={`inline-flex items-center gap-1 ${THEME_CLASSES.inkMuted}`}>
                <Headphones className="h-3 w-3" aria-hidden="true" />
                <span>Media</span>
              </span>
            </>
          )}
        </p>
      </div>

      <div className="lg:col-span-3 flex items-center lg:justify-end gap-1.5">
        {isOwner && (
          <>
            {!isConfirmingDelete && (
              <button
                type="button"
                onClick={() => onEditDiscourse(d)}
                aria-label={`Edit ${d.title}`}
                className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center ${THEME_CLASSES.inkMuted} hover:text-[var(--accent-ink)] cursor-pointer`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            <ConfirmDeleteAction
              variant="icon"
              isConfirming={isConfirmingDelete}
              onRequestConfirm={() => onRequestDelete(d.id)}
              onConfirm={() => onConfirmDelete(d.id)}
              onCancel={onCancelDelete}
              ariaLabel={`Delete ${d.title}`}
            />
          </>
        )}
        <button
          type="button"
          onClick={() => onToggleBookmark(d.id)}
          aria-label={isSaved ? `Remove ${d.title} from shelf` : `Save ${d.title} to shelf`}
          className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center ${THEME_CLASSES.inkMuted} hover:text-[var(--accent-ink)] cursor-pointer`}
        >
          <Bookmark
            className={`h-4 w-4 ${
              isSaved ? 'fill-[var(--accent-ink)] text-[var(--accent-ink)]' : ''
            }`}
          />
        </button>
        <button
          type="button"
          onClick={() => onExportMarkdown(d)}
          aria-label={`Export ${d.title} as Markdown`}
          className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onSelectDiscourse(d.id)}
          className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0`}
        >
          Read
        </button>
      </div>
    </div>
  );
}

export function DiscourseCatalog({
  discourses,
  sayadaws,
  bookmarks,
  isOwner,
  searchQuery,
  onSearchChange,
  selectedCollection,
  onCollectionChange,
  selectedSayadawId,
  onSayadawChange,
  selectedLanguage,
  onLanguageChange,
  onlySaved,
  onToggleOnlySaved,
  darkMode,
  onToggleDarkMode,
  onSelectDiscourse,
  onToggleBookmark,
  onExportMarkdown,
  onEditDiscourse,
  onDeleteDiscourse,
  onOpenStoreModal,
}: DiscourseCatalogProps) {
  const [sortByTime, setSortByTime] = useState<'default' | 'shortest' | 'longest'>('default');
  const [groupBySayadaw, setGroupBySayadaw] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const countBySayadaw = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of discourses) {
      counts.set(d.sayadawId, (counts.get(d.sayadawId) ?? 0) + 1);
    }
    return counts;
  }, [discourses]);

  const readingTimesById = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of discourses) {
      map.set(d.id, calculateEstimatedReadingMinutes(d));
    }
    return map;
  }, [discourses]);

  const filtered = useMemo(() => {
    const base = discourses.filter((d) => {
      if (selectedCollection !== 'All' && d.collection !== selectedCollection) return false;
      if (selectedSayadawId !== 'All' && d.sayadawId !== selectedSayadawId) return false;
      if (selectedLanguage !== 'All' && d.language !== selectedLanguage) return false;
      if (onlySaved && !bookmarks.includes(d.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = [
          d.title,
          d.chineseTitle || '',
          d.paliSubtitle || '',
          d.sayadawName,
          d.sourceText,
          d.summary,
          d.accessionCode,
          d.collection,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortByTime === 'shortest') {
      return [...base].sort(
        (a, b) => (readingTimesById.get(a.id) ?? 0) - (readingTimesById.get(b.id) ?? 0),
      );
    }
    if (sortByTime === 'longest') {
      return [...base].sort(
        (a, b) => (readingTimesById.get(b.id) ?? 0) - (readingTimesById.get(a.id) ?? 0),
      );
    }
    return base;
  }, [
    discourses,
    selectedCollection,
    selectedSayadawId,
    selectedLanguage,
    onlySaved,
    bookmarks,
    searchQuery,
    sortByTime,
    readingTimesById,
  ]);

  const totalStudyMinutes = useMemo(
    () => filtered.reduce((sum, d) => sum + (readingTimesById.get(d.id) ?? 0), 0),
    [filtered, readingTimesById],
  );

  const groupedBySayadaw = useMemo(() => {
    const groups = new Map<
      string,
      { sayadawId: string; sayadawName: string; items: DhammaDiscourse[] }
    >();
    for (const d of filtered) {
      const existing = groups.get(d.sayadawId);
      if (existing) {
        existing.items.push(d);
      } else {
        groups.set(d.sayadawId, {
          sayadawId: d.sayadawId,
          sayadawName: d.sayadawName,
          items: [d],
        });
      }
    }
    return Array.from(groups.values());
  }, [filtered]);

  const isDefaultUnfiltered =
    selectedCollection === 'All' &&
    selectedSayadawId === 'All' &&
    selectedLanguage === 'All' &&
    !onlySaved &&
    !searchQuery.trim() &&
    sortByTime === 'default' &&
    !groupBySayadaw;

  const leadDiscourse = isDefaultUnfiltered
    ? filtered.find((d) => d.featuredRank === 'lead') || filtered[0]
    : undefined;

  const secondaryDiscourses = isDefaultUnfiltered
    ? filtered
        .filter((d) => d.id !== leadDiscourse?.id && d.featuredRank === 'secondary')
        .slice(0, 2)
    : [];

  const handleResetFilters = () => {
    onSearchChange('');
    onCollectionChange('All');
    onSayadawChange('All');
    onLanguageChange('All');
    setSortByTime('default');
    setGroupBySayadaw(false);
    if (onlySaved) onToggleOnlySaved();
  };

  return (
    <section
      id={SECTION_IDS.discourses}
      className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8 sm:py-16"
    >
      <SectionHeader
        kicker="01. Archival Collection"
        title="Sayadaw Discourses & Study Index"
        actions={
          <>
            {isOwner && (
              <button
                type="button"
                onClick={() =>
                  onOpenStoreModal(selectedSayadawId !== 'All' ? selectedSayadawId : undefined)
                }
                className={THEME_CLASSES.btnAccent}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Discourse</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleOnlySaved}
              className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                onlySaved
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-[var(--accent-primary)]'
                  : `bg-transparent ${THEME_CLASSES.inkSecondary} ${THEME_CLASSES.borderStrong} hover:border-[var(--accent-ink)]`
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="tabular-nums">Saved Shelf ({bookmarks.length})</span>
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium ${THEME_CLASSES.inkSecondary} border ${THEME_CLASSES.borderStrong} hover:border-[var(--accent-ink)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer`}
              aria-label={
                darkMode ? 'Switch to Archival Paper light theme' : 'Switch to Warm Night dark theme'
              }
            >
              {darkMode ? (
                <>
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Archival Paper</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Warm Night</span>
                </>
              )}
            </button>
          </>
        }
      />

      {/* Interactive Filter & Search Controls */}
      <div className={`py-6 space-y-5 border-b ${THEME_CLASSES.borderHairline}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search
              className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${THEME_CLASSES.inkSubtle}`}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search titles, Sayadaw, Chinese terms, or Sutta reference..."
              aria-label="Search Dhamma archive"
              className={`w-full min-h-[44px] pl-10 pr-10 py-2 text-sm bg-[var(--surface-input)] ${THEME_CLASSES.inkPrimary} placeholder:text-[var(--ink-subtle)] border ${THEME_CLASSES.borderStrong} focus:outline-none focus:border-[var(--accent-ink)]`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 ${THEME_CLASSES.inkSubtle} hover:text-[var(--ink-primary)] cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSayadawId}
              onChange={(e) => onSayadawChange(e.target.value)}
              aria-label="Filter by Sayadaw"
              className={`min-h-[44px] px-3.5 py-2 text-sm bg-[var(--surface-canvas)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} focus:outline-none focus:border-[var(--accent-ink)] cursor-pointer`}
            >
              <option value="All">All Sayadaw Masters</option>
              {sayadaws.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as DiscourseLanguage | 'All')}
              aria-label="Filter by Language"
              className={`min-h-[44px] px-3.5 py-2 text-sm bg-[var(--surface-canvas)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} focus:outline-none focus:border-[var(--accent-ink)] cursor-pointer`}
            >
              {LANGUAGE_FILTERS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'All' ? 'All Scripts & Languages' : lang}
                </option>
              ))}
            </select>

            <select
              value={sortByTime}
              onChange={(e) =>
                setSortByTime(e.target.value as 'default' | 'shortest' | 'longest')
              }
              aria-label="Sort by estimated reading time"
              className={`min-h-[44px] px-3.5 py-2 text-sm bg-[var(--surface-canvas)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} focus:outline-none focus:border-[var(--accent-ink)] cursor-pointer`}
            >
              <option value="default">Archive Order</option>
              <option value="shortest">Shortest Study First</option>
              <option value="longest">Longest Study First</option>
            </select>

            <button
              type="button"
              onClick={() => setGroupBySayadaw((prev) => !prev)}
              aria-pressed={groupBySayadaw}
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                groupBySayadaw
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
                  : `${THEME_CLASSES.borderStrong} bg-[var(--surface-canvas)] ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)]`
              }`}
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Group by Sayadaw</span>
            </button>
          </div>
        </div>

        {/* Index by Sayadaw Bar */}
        <div className="space-y-2">
          <p className={`text-[11px] tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
            Index by Sayadaw
          </p>
          <div
            role="tablist"
            aria-label="Index discourses by Sayadaw"
            className="flex items-center gap-1.5 overflow-x-auto pb-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedSayadawId === 'All'}
              onClick={() => onSayadawChange('All')}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer border ${
                selectedSayadawId === 'All'
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
                  : `${THEME_CLASSES.borderHairline} bg-[var(--surface-canvas)] ${THEME_CLASSES.inkMuted} hover:border-[var(--accent-ink)] hover:text-[var(--ink-primary)]`
              }`}
            >
              <span className="tabular-nums">All Sayadaws ({discourses.length})</span>
            </button>
            {sayadaws.map((s) => {
              const active = selectedSayadawId === s.id;
              const cnt = countBySayadaw.get(s.id) ?? 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSayadawChange(s.id)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer border ${
                    active
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
                      : `${THEME_CLASSES.borderHairline} bg-[var(--surface-canvas)] ${THEME_CLASSES.inkMuted} hover:border-[var(--accent-ink)] hover:text-[var(--ink-primary)]`
                  }`}
                >
                  <span className="tabular-nums">
                    {s.name} ({cnt})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Segmented Collection Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter by Dhamma collection"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          {COLLECTION_FILTERS.map((col) => {
            const active = selectedCollection === col;
            return (
              <button
                key={col}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCollectionChange(col)}
                className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                    : `bg-[var(--surface-muted)] ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)]`
                }`}
              >
                {col === 'All' ? 'All Collections' : col}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className={`py-16 text-center space-y-4 border-b ${THEME_CLASSES.borderHairline}`}>
          <p className={`font-display text-2xl font-medium ${THEME_CLASSES.inkPrimary}`}>
            {discourses.length === 0
              ? 'No discourses in the archive yet'
              : 'No matching Sayadaw discourses found'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {discourses.length > 0 && (
              <button type="button" onClick={handleResetFilters} className={THEME_CLASSES.btnOutline}>
                Reset Filters
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                onClick={() =>
                  onOpenStoreModal(selectedSayadawId !== 'All' ? selectedSayadawId : undefined)
                }
                className={THEME_CLASSES.btnAccent}
              >
                Add Discourse
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Tier 1 & Tier 2 Featured Editorial Grid */}
          {leadDiscourse && (
            <div className={`py-10 border-b ${THEME_CLASSES.borderHairline} space-y-12`}>
              <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-6">
                  <ArchivalImage
                    src={leadDiscourse.coverImage}
                    alt={leadDiscourse.title}
                    aspectClassName="aspect-[4/3] lg:h-full"
                    className="h-full"
                  />
                </div>
                <div className="lg:col-span-6 flex flex-col justify-between gap-6 py-1">
                  <div className="space-y-4">
                    <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkSubtle}`}>
                      <span className={`font-mono-code ${THEME_CLASSES.accentInk}`}>
                        {leadDiscourse.accessionCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{leadDiscourse.collection}</span>
                      <span aria-hidden="true">·</span>
                      <span>{leadDiscourse.language}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        <span>
                          {readingTimesById.get(leadDiscourse.id) ?? leadDiscourse.readingMinutes} min read
                        </span>
                      </span>
                    </div>

                    <h3
                      className={`font-display text-3xl sm:text-[2.25rem] font-semibold leading-[1.18] ${THEME_CLASSES.inkPrimary} text-balance`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectDiscourse(leadDiscourse.id)}
                        className="text-left hover:text-[var(--accent-ink)] transition-colors cursor-pointer"
                      >
                        {leadDiscourse.title}
                      </button>
                    </h3>

                    {leadDiscourse.chineseTitle && (
                      <p className={`text-base font-medium ${THEME_CLASSES.inkMuted}`}>
                        {leadDiscourse.chineseTitle}
                      </p>
                    )}

                    <p className={`text-sm font-medium ${THEME_CLASSES.inkBody}`}>
                      <button
                        type="button"
                        onClick={() => onSayadawChange(leadDiscourse.sayadawId)}
                        className="hover:text-[var(--accent-ink)] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {leadDiscourse.sayadawName}
                      </button>
                      <span className={`mx-2 ${THEME_CLASSES.inkSubtle}`} aria-hidden="true">
                        ·
                      </span>
                      <span className={`font-normal ${THEME_CLASSES.inkMuted}`}>
                        {leadDiscourse.sourceText}
                      </span>
                    </p>

                    <p className={`text-[0.975rem] leading-[1.7] ${THEME_CLASSES.inkSecondary}`}>
                      {leadDiscourse.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectDiscourse(leadDiscourse.id)}
                      className={THEME_CLASSES.btnPrimary}
                    >
                      Read Discourse
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleBookmark(leadDiscourse.id)}
                      className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-medium ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer whitespace-nowrap shrink-0`}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          bookmarks.includes(leadDiscourse.id)
                            ? 'fill-[var(--accent-ink)] text-[var(--accent-ink)]'
                            : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span>{bookmarks.includes(leadDiscourse.id) ? 'Saved' : 'Save to Shelf'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportMarkdown(leadDiscourse)}
                      className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-medium ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer whitespace-nowrap shrink-0`}
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>Export .md</span>
                    </button>
                  </div>
                </div>
              </article>

              {secondaryDiscourses.length > 0 && (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t ${THEME_CLASSES.borderHairline}`}
                >
                  {secondaryDiscourses.map((d) => (
                    <article key={d.id} className="flex flex-col justify-between gap-5">
                      <div className="space-y-4">
                        <ArchivalImage
                          src={d.coverImage}
                          alt={d.title}
                          aspectClassName="aspect-[16/10]"
                        />

                        <div className="space-y-2.5">
                          <div
                            className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkSubtle}`}
                          >
                            <span className={`font-mono-code ${THEME_CLASSES.accentInk}`}>
                              {d.accessionCode}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{d.collection}</span>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              <span>{readingTimesById.get(d.id) ?? d.readingMinutes} min read</span>
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

                          {d.chineseTitle && (
                            <p className={`text-sm ${THEME_CLASSES.inkMuted}`}>{d.chineseTitle}</p>
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
                          Read Discourse
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleBookmark(d.id)}
                          className={`text-xs ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
                        >
                          {bookmarks.includes(d.id) ? 'Saved' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onExportMarkdown(d)}
                          className={`text-xs ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
                        >
                          Export .md
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tier 3: Complete Archive Catalogue */}
          <div className="pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4 border-b border-[var(--ink-primary)]/20">
              <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                {groupBySayadaw ? 'Catalogue Indexed by Sayadaw' : 'Complete Archival Catalogue'}
              </h3>
              <span className={`font-mono-code text-xs ${THEME_CLASSES.inkSubtle} tabular-nums`}>
                {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} · {totalStudyMinutes}{' '}
                min total study
              </span>
            </div>

            {groupBySayadaw ? (
              <div className="space-y-10 pt-6">
                {groupedBySayadaw.map((group) => (
                  <div key={group.sayadawId} className="space-y-2">
                    <div
                      className={`flex flex-wrap items-baseline justify-between gap-3 pb-2.5 border-b ${THEME_CLASSES.borderStrong}`}
                    >
                      <div className="flex items-baseline gap-3">
                        <button
                          type="button"
                          onClick={() => onSayadawChange(group.sayadawId)}
                          className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary} hover:text-[var(--accent-ink)] transition-colors cursor-pointer`}
                        >
                          {group.sayadawName}
                        </button>
                        <span
                          className={`font-mono-code text-xs ${THEME_CLASSES.inkSubtle} tabular-nums`}
                        >
                          {group.items.length}{' '}
                          {group.items.length === 1 ? 'discourse' : 'discourses'}
                        </span>
                      </div>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => onOpenStoreModal(group.sayadawId)}
                          className={`inline-flex items-center gap-1 text-xs font-medium ${THEME_CLASSES.accentInk} hover:underline underline-offset-4 cursor-pointer`}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Add under this Sayadaw</span>
                        </button>
                      )}
                    </div>

                    <div className={THEME_CLASSES.divideHairline}>
                      {group.items.map((d) => (
                        <CatalogueRow
                          key={d.id}
                          discourse={d}
                          sayadaws={sayadaws}
                          estMinutes={readingTimesById.get(d.id) ?? d.readingMinutes}
                          isSaved={bookmarks.includes(d.id)}
                          isOwner={isOwner}
                          isConfirmingDelete={confirmDeleteId === d.id}
                          showSayadawColumn={false}
                          onSelectDiscourse={onSelectDiscourse}
                          onSayadawChange={onSayadawChange}
                          onToggleBookmark={onToggleBookmark}
                          onExportMarkdown={onExportMarkdown}
                          onEditDiscourse={onEditDiscourse}
                          onRequestDelete={setConfirmDeleteId}
                          onConfirmDelete={(id) => {
                            onDeleteDiscourse(id);
                            setConfirmDeleteId(null);
                          }}
                          onCancelDelete={() => setConfirmDeleteId(null)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={THEME_CLASSES.divideHairline}>
                {filtered.map((d) => (
                  <CatalogueRow
                    key={d.id}
                    discourse={d}
                    sayadaws={sayadaws}
                    estMinutes={readingTimesById.get(d.id) ?? d.readingMinutes}
                    isSaved={bookmarks.includes(d.id)}
                    isOwner={isOwner}
                    isConfirmingDelete={confirmDeleteId === d.id}
                    showSayadawColumn
                    onSelectDiscourse={onSelectDiscourse}
                    onSayadawChange={onSayadawChange}
                    onToggleBookmark={onToggleBookmark}
                    onExportMarkdown={onExportMarkdown}
                    onEditDiscourse={onEditDiscourse}
                    onRequestDelete={setConfirmDeleteId}
                    onConfirmDelete={(id) => {
                      onDeleteDiscourse(id);
                      setConfirmDeleteId(null);
                    }}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
