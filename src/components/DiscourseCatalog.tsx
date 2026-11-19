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
import {
  DhammaDiscourse,
  DiscourseLanguage,
  SayadawProfile,
  TraditionCollection,
} from '../types/dhamma';
import { calculateEstimatedReadingMinutes } from '../utils/storageAndExport';
import { buildDiscoursePath } from '../utils/urlRouter';
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
  onOpenStoreModal: (presetSayadawId?: string) => void;
}

const COLLECTIONS: (TraditionCollection | 'All')[] = [
  'All',
  'Abhidhamma',
  'Satipatthana & Vipassana',
  'Sutta Pitaka',
  'Visuddhimagga',
  'Monastic Talks',
];

const LANGUAGES: (DiscourseLanguage | 'All')[] = [
  'All',
  'Pāli · 繁體中文 · English',
  'Pāli · English',
  'English',
  '繁體中文',
];

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
  onOpenStoreModal,
}: DiscourseCatalogProps) {
  const [sortByTime, setSortByTime] = useState<'default' | 'shortest' | 'longest'>('default');
  const [groupBySayadaw, setGroupBySayadaw] = useState(false);

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
    const groups = new Map<string, { sayadawId: string; sayadawName: string; items: DhammaDiscourse[] }>();
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
    ? filtered.filter((d) => d.id !== leadDiscourse?.id && d.featuredRank === 'secondary').slice(0, 2)
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
    <section id="catalog-section" className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8 sm:py-16">
      {/* Section Heading & Theme Switch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5DFD3] dark:border-[#342E28]">
        <div className="space-y-2">
          <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
            01. Archival Collection
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] text-balance">
            Sayadaw Discourses &amp; Study Index
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isOwner && (
            <button
              type="button"
              onClick={() =>
                onOpenStoreModal(selectedSayadawId !== 'All' ? selectedSayadawId : undefined)
              }
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#B45309] dark:hover:bg-[#92400E] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
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
                ? 'bg-[#9A3412] text-[#FBF9F5] border-[#9A3412] dark:bg-[#B45309] dark:border-[#B45309]'
                : 'bg-transparent text-[#44403C] dark:text-[#D6D3D1] border-[#D6CEBE] dark:border-[#44403C] hover:border-[#9A3412]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">Saved Shelf ({bookmarks.length})</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium text-[#44403C] dark:text-[#D6D3D1] border border-[#D6CEBE] dark:border-[#44403C] hover:border-[#9A3412] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={darkMode ? 'Switch to Archival Paper light theme' : 'Switch to Warm Night dark theme'}
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
        </div>
      </div>

      {/* Interactive Filter & Search Controls */}
      <div className="py-6 space-y-5 border-b border-[#E5DFD3] dark:border-[#342E28]">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Pāli titles, Sayadaw, Chinese terms, or Sutta reference (e.g. DN 22)..."
              aria-label="Search Dhamma archive"
              className="w-full min-h-[44px] pl-10 pr-10 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] placeholder:text-[#78716C] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412] dark:focus:border-[#D97757]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sayadaw & Language Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSayadawId}
              onChange={(e) => onSayadawChange(e.target.value)}
              aria-label="Filter by Sayadaw"
              className="min-h-[44px] px-3.5 py-2 text-sm bg-[#FBF9F5] dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412] cursor-pointer"
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
              className="min-h-[44px] px-3.5 py-2 text-sm bg-[#FBF9F5] dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412] cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
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
              className="min-h-[44px] px-3.5 py-2 text-sm bg-[#FBF9F5] dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412] cursor-pointer"
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
                  ? 'border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] dark:border-[#B45309] dark:bg-[#B45309]'
                  : 'border-[#D6CEBE] dark:border-[#3F3832] bg-[#FBF9F5] dark:bg-[#221E1A] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#9A3412]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Group by Sayadaw</span>
            </button>
          </div>
        </div>

        {/* Index by Sayadaw Bar */}
        <div className="space-y-2">
          <p className="text-[11px] tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
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
                  ? 'border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] dark:border-[#B45309] dark:bg-[#B45309]'
                  : 'border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#221E1A] text-[#57534E] dark:text-[#A8A29E] hover:border-[#9A3412] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
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
                      ? 'border-[#9A3412] bg-[#9A3412] text-[#FBF9F5] dark:border-[#B45309] dark:bg-[#B45309]'
                      : 'border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#221E1A] text-[#57534E] dark:text-[#A8A29E] hover:border-[#9A3412] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
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
          {COLLECTIONS.map((col) => {
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
                    ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                    : 'bg-[#F4EFE6] text-[#57534E] hover:text-[#1C1917] dark:bg-[#25211D] dark:text-[#A8A29E] dark:hover:text-[#F5F5F4]'
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
        <div className="py-16 text-center space-y-4 border-b border-[#E5DFD3] dark:border-[#342E28]">
          <p className="font-display text-2xl font-medium text-[#1C1917] dark:text-[#F5F5F4]">
            No matching Sayadaw discourses found
          </p>
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E] max-w-md mx-auto">
            Try clearing your search query or filters, or store a new Sayadaw Dhamma discourse into
            the archive.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[40px] px-4 py-2 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] cursor-pointer"
            >
              Reset Filters
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={() =>
                  onOpenStoreModal(selectedSayadawId !== 'All' ? selectedSayadawId : undefined)
                }
                className="min-h-[40px] px-4 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] cursor-pointer"
              >
                Store New Teaching
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Tier 1 & Tier 2 Featured Editorial Grid (shown in default catalog view) */}
          {leadDiscourse && (
            <div className="py-10 border-b border-[#E5DFD3] dark:border-[#342E28] space-y-12">
              {/* Tier 1: Lead Discourse */}
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
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
                      <span className="font-mono-code text-[#9A3412] dark:text-[#FDBA74]">
                        {leadDiscourse.accessionCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{leadDiscourse.collection}</span>
                      <span aria-hidden="true">·</span>
                      <span>{leadDiscourse.language}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        <span>{readingTimesById.get(leadDiscourse.id) ?? leadDiscourse.readingMinutes} min read</span>
                      </span>
                    </div>

                    <h3 className="font-display text-3xl sm:text-[2.25rem] font-semibold leading-[1.18] text-[#1C1917] dark:text-[#F5F5F4] text-balance">
                      <button
                        type="button"
                        onClick={() => onSelectDiscourse(leadDiscourse.id)}
                        className="text-left hover:text-[#9A3412] dark:hover:text-[#FDBA74] transition-colors cursor-pointer"
                      >
                        {leadDiscourse.title}
                      </button>
                    </h3>

                    {leadDiscourse.chineseTitle && (
                      <p className="text-base font-medium text-[#57534E] dark:text-[#D6D3D1]">
                        {leadDiscourse.chineseTitle}
                      </p>
                    )}

                    <p className="text-sm font-medium text-[#292524] dark:text-[#E7E5E4]">
                      <button
                        type="button"
                        onClick={() => onSayadawChange(leadDiscourse.sayadawId)}
                        className="hover:text-[#9A3412] dark:hover:text-[#FDBA74] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {leadDiscourse.sayadawName}
                      </button>
                      <span className="mx-2 text-[#A8A29E]" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-normal text-[#57534E] dark:text-[#A8A29E]">
                        {leadDiscourse.sourceText}
                      </span>
                    </p>

                    <p className="text-[0.975rem] leading-[1.7] text-[#44403C] dark:text-[#D6D3D1]">
                      {leadDiscourse.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectDiscourse(leadDiscourse.id)}
                      className="min-h-[40px] px-5 py-2 text-sm font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Read Discourse
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleBookmark(leadDiscourse.id)}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          bookmarks.includes(leadDiscourse.id)
                            ? 'fill-[#9A3412] text-[#9A3412] dark:fill-[#FDBA74] dark:text-[#FDBA74]'
                            : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span>{bookmarks.includes(leadDiscourse.id) ? 'Saved' : 'Save to Shelf'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportMarkdown(leadDiscourse)}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>Export .md</span>
                    </button>
                  </div>
                </div>
              </article>

              {/* Tier 2: Secondary Editorial Pair */}
              {secondaryDiscourses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E5DFD3] dark:border-[#342E28]">
                  {secondaryDiscourses.map((d) => (
                    <article key={d.id} className="flex flex-col justify-between gap-5">
                      <div className="space-y-4">
                        <ArchivalImage
                          src={d.coverImage}
                          alt={d.title}
                          aspectClassName="aspect-[16/10]"
                        />

                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
                            <span className="font-mono-code text-[#9A3412] dark:text-[#FDBA74]">
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

                          <h3 className="font-display text-2xl font-semibold leading-snug text-[#1C1917] dark:text-[#F5F5F4] text-balance">
                            <button
                              type="button"
                              onClick={() => onSelectDiscourse(d.id)}
                              className="text-left hover:text-[#9A3412] dark:hover:text-[#FDBA74] transition-colors cursor-pointer"
                            >
                              {d.title}
                            </button>
                          </h3>

                          {d.chineseTitle && (
                            <p className="text-sm text-[#57534E] dark:text-[#D6D3D1]">
                              {d.chineseTitle}
                            </p>
                          )}

                          <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                            <button
                              type="button"
                              onClick={() => onSayadawChange(d.sayadawId)}
                              className="font-medium text-[#292524] dark:text-[#E7E5E4] hover:text-[#9A3412] dark:hover:text-[#FDBA74] hover:underline underline-offset-4 cursor-pointer"
                            >
                              {d.sayadawName}
                            </button>
                            <span className="mx-1.5" aria-hidden="true">·</span>
                            <span>{d.sourceText}</span>
                          </p>

                          <p className="text-sm leading-relaxed text-[#44403C] dark:text-[#D6D3D1]">
                            {d.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={() => onSelectDiscourse(d.id)}
                          className="text-sm font-medium text-[#9A3412] dark:text-[#FDBA74] hover:underline underline-offset-4 cursor-pointer"
                        >
                          Read Discourse
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleBookmark(d.id)}
                          className="text-xs text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
                        >
                          {bookmarks.includes(d.id) ? 'Saved' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onExportMarkdown(d)}
                          className="text-xs text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
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

          {/* Tier 3: Complete Archive Catalogue Table / Index Rows */}
          <div className="pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4 border-b border-[#1C1917]/20 dark:border-[#E7E5E4]/20">
              <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                {groupBySayadaw ? 'Catalogue Indexed by Sayadaw' : 'Complete Archival Catalogue'}
              </h3>
              <span className="font-mono-code text-xs text-[#78716C] dark:text-[#A8A29E] tabular-nums">
                {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} · {totalStudyMinutes} min total study
              </span>
            </div>

            {groupBySayadaw ? (
              <div className="space-y-10 pt-6">
                {groupedBySayadaw.map((group) => (
                  <div key={group.sayadawId} className="space-y-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-3 pb-2.5 border-b border-[#D6CEBE] dark:border-[#342E28]">
                      <div className="flex items-baseline gap-3">
                        <button
                          type="button"
                          onClick={() => onSayadawChange(group.sayadawId)}
                          className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] hover:text-[#9A3412] dark:hover:text-[#FDBA74] transition-colors cursor-pointer"
                        >
                          {group.sayadawName}
                        </button>
                        <span className="font-mono-code text-xs text-[#78716C] dark:text-[#A8A29E] tabular-nums">
                          {group.items.length} {group.items.length === 1 ? 'discourse' : 'discourses'}
                        </span>
                      </div>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => onOpenStoreModal(group.sayadawId)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#9A3412] dark:text-[#FDBA74] hover:underline underline-offset-4 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Add under this Sayadaw</span>
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-[#E5DFD3] dark:divide-[#342E28]">
                      {group.items.map((d) => {
                        const isSaved = bookmarks.includes(d.id);
                        const estMinutes = readingTimesById.get(d.id) ?? d.readingMinutes;
                        const hasMedia = Boolean(
                          d.audioReferenceUrl || (d.mediaItems && d.mediaItems.length > 0),
                        );
                        return (
                          <div
                            key={d.id}
                            className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-center hover:bg-[#F4EFE6]/50 dark:hover:bg-[#221E1A]/60 transition-colors px-2 -mx-2"
                          >
                            <div className="lg:col-span-2 flex items-center gap-2">
                              <span className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74] tabular-nums">
                                {d.accessionCode}
                              </span>
                            </div>

                            <div className="lg:col-span-6 space-y-1">
                              <button
                                type="button"
                                onClick={() => onSelectDiscourse(d.id)}
                                className="text-left font-display text-xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] hover:text-[#9A3412] dark:hover:text-[#FDBA74] transition-colors cursor-pointer"
                              >
                                {d.title}
                              </button>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
                                {d.chineseTitle && <span>{d.chineseTitle}</span>}
                                {d.chineseTitle && <span aria-hidden="true">·</span>}
                                <span>{d.sourceText}</span>
                              </div>
                            </div>

                            <div className="lg:col-span-2 text-xs text-[#57534E] dark:text-[#A8A29E] space-y-0.5">
                              <p>{d.collection}</p>
                              <p className="inline-flex items-center gap-2 tabular-nums text-[#9A3412] dark:text-[#FDBA74]">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" aria-hidden="true" />
                                  <span>{estMinutes} min</span>
                                </span>
                                {hasMedia && (
                                  <span className="inline-flex items-center gap-1 text-[#57534E] dark:text-[#A8A29E]">
                                    <Headphones className="h-3 w-3" aria-hidden="true" />
                                    <span>Media</span>
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="lg:col-span-2 flex items-center lg:justify-end gap-2">
                              {isOwner && (
                                <button
                                  type="button"
                                  onClick={() => onEditDiscourse(d)}
                                  aria-label={`Edit ${d.title}`}
                                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onToggleBookmark(d.id)}
                                aria-label={
                                  isSaved ? `Remove ${d.title} from shelf` : `Save ${d.title} to shelf`
                                }
                                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer"
                              >
                                <Bookmark
                                  className={`h-4 w-4 ${
                                    isSaved
                                      ? 'fill-[#9A3412] text-[#9A3412] dark:fill-[#FDBA74] dark:text-[#FDBA74]'
                                      : ''
                                  }`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => onExportMarkdown(d)}
                                aria-label={`Export ${d.title} as Markdown`}
                                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onSelectDiscourse(d.id)}
                                className="min-h-[40px] px-3.5 py-1.5 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] hover:text-[#9A3412] dark:hover:border-[#FDBA74] dark:hover:text-[#FDBA74] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                              >
                                Read
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-[#E5DFD3] dark:divide-[#342E28]">
                {filtered.map((d) => {
                  const isSaved = bookmarks.includes(d.id);
                  const estMinutes = readingTimesById.get(d.id) ?? d.readingMinutes;
                  const hasMedia = Boolean(
                    d.audioReferenceUrl || (d.mediaItems && d.mediaItems.length > 0),
                  );
                  return (
                    <div
                      key={d.id}
                      className="py-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-center hover:bg-[#F4EFE6]/50 dark:hover:bg-[#221E1A]/60 transition-colors px-2 -mx-2"
                    >
                      <div className="lg:col-span-2 flex items-center gap-3">
                        <span className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74] tabular-nums">
                          {d.accessionCode}
                        </span>
                        {isOwner && d.isUserCreated && (
                          <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                            · Draft
                          </span>
                        )}
                      </div>

                      <div className="lg:col-span-5 space-y-1">
                        <button
                          type="button"
                          onClick={() => onSelectDiscourse(d.id)}
                          className="text-left font-display text-xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] hover:text-[#9A3412] dark:hover:text-[#FDBA74] transition-colors cursor-pointer"
                        >
                          {d.title}
                        </button>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
                          {d.chineseTitle && <span>{d.chineseTitle}</span>}
                          {d.chineseTitle && <span aria-hidden="true">·</span>}
                          <span>{d.sourceText}</span>
                        </div>
                        <p className="font-mono-code text-[11px] text-[#78716C] dark:text-[#A8A29E] truncate">
                          {buildDiscoursePath(d, sayadaws)}
                        </p>
                      </div>

                      <div className="lg:col-span-3 text-xs text-[#57534E] dark:text-[#A8A29E] space-y-0.5">
                        <p>
                          <button
                            type="button"
                            onClick={() => onSayadawChange(d.sayadawId)}
                            className="font-medium text-[#292524] dark:text-[#E7E5E4] hover:text-[#9A3412] dark:hover:text-[#FDBA74] hover:underline underline-offset-4 cursor-pointer text-left"
                          >
                            {d.sayadawName}
                          </button>
                        </p>
                        <p className="inline-flex flex-wrap items-center gap-1.5">
                          <span>{d.collection}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 tabular-nums text-[#9A3412] dark:text-[#FDBA74]">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            <span>{estMinutes} min read</span>
                          </span>
                          {hasMedia && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-[#57534E] dark:text-[#A8A29E]">
                                <Headphones className="h-3 w-3" aria-hidden="true" />
                                <span>Media</span>
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="lg:col-span-2 flex items-center lg:justify-end gap-2">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => onEditDiscourse(d)}
                            aria-label={`Edit ${d.title}`}
                            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleBookmark(d.id)}
                          aria-label={isSaved ? `Remove ${d.title} from shelf` : `Save ${d.title} to shelf`}
                          className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer"
                        >
                          <Bookmark
                            className={`h-4 w-4 ${
                              isSaved ? 'fill-[#9A3412] text-[#9A3412] dark:fill-[#FDBA74] dark:text-[#FDBA74]' : ''
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => onExportMarkdown(d)}
                          aria-label={`Export ${d.title} as Markdown`}
                          className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectDiscourse(d.id)}
                          className="min-h-[40px] px-3.5 py-1.5 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] hover:text-[#9A3412] dark:hover:border-[#FDBA74] dark:hover:text-[#FDBA74] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Read
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
