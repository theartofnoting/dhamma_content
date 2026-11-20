import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { SECTION_IDS } from '../config/siteConfig';
import { LocaleDictionary } from '../i18n';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import {
  buildReadingTimeMap,
  filterDiscourses,
  groupDiscoursesBySayadaw,
  selectEditorialTiers,
} from '../tools/discourseFilters';
import {
  DhammaDiscourse,
  DiscourseLanguage,
  SayadawProfile,
  TraditionCollection,
} from '../types/dhamma';
import { CatalogToolbar } from './catalog/CatalogToolbar';
import { CatalogueRow } from './catalog/CatalogueRow';
import { DiscourseFeatureCards } from './catalog/DiscourseFeatureCards';

interface DiscourseCatalogProps {
  dict: LocaleDictionary;
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

export function DiscourseCatalog({
  dict,
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
  const [groupBySayadaw, setGroupBySayadaw] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filterDiscourses(discourses, {
        searchQuery,
        collection: selectedCollection,
        sayadawId: selectedSayadawId,
        language: selectedLanguage,
        onlySaved,
        bookmarks,
      }),
    [
      discourses,
      searchQuery,
      selectedCollection,
      selectedSayadawId,
      selectedLanguage,
      onlySaved,
      bookmarks,
    ],
  );

  const isFiltering =
    Boolean(searchQuery.trim()) ||
    selectedCollection !== 'All' ||
    selectedSayadawId !== 'All' ||
    selectedLanguage !== 'All' ||
    onlySaved;

  const { leadDiscourse, secondaryDiscourses } = useMemo(
    () => selectEditorialTiers(filtered, isFiltering),
    [filtered, isFiltering],
  );

  const groupedBySayadaw = useMemo(
    () => groupDiscoursesBySayadaw(filtered, sayadaws),
    [filtered, sayadaws],
  );

  const { byId: readingTimesById, totalMinutes: totalStudyMinutes } = useMemo(
    () => buildReadingTimeMap(filtered),
    [filtered],
  );

  const resetFilters = () => {
    onSearchChange('');
    onCollectionChange('All');
    onSayadawChange('All');
    onLanguageChange('All');
    if (onlySaved) onToggleOnlySaved();
  };

  return (
    <section id={SECTION_IDS.discourses} className={THEME_CLASSES.sectionContainer}>
      <SectionHeader
        kicker={dict.catalog.kicker}
        title={dict.catalog.title}
        description={dict.catalog.description}
        bottomPaddingClassName="pb-6"
        actions={
          isOwner ? (
            <button
              type="button"
              onClick={() =>
                onOpenStoreModal(selectedSayadawId !== 'All' ? selectedSayadawId : undefined)
              }
              className={THEME_CLASSES.btnAccent}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{dict.catalog.addTeaching}</span>
            </button>
          ) : undefined
        }
      />

      <CatalogToolbar
        dict={dict}
        sayadaws={sayadaws}
        bookmarkCount={bookmarks.length}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedCollection={selectedCollection}
        onCollectionChange={onCollectionChange}
        selectedSayadawId={selectedSayadawId}
        onSayadawChange={onSayadawChange}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        onlySaved={onlySaved}
        onToggleOnlySaved={onToggleOnlySaved}
        groupBySayadaw={groupBySayadaw}
        onToggleGroupBySayadaw={() => setGroupBySayadaw((prev) => !prev)}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      {filtered.length === 0 ? (
        <div className={`py-14 text-center space-y-3 border-t ${THEME_CLASSES.borderHairline}`}>
          <p className={`font-display text-2xl ${THEME_CLASSES.inkPrimary}`}>
            {dict.catalog.emptyTitle}
          </p>
          <p className={`text-sm ${THEME_CLASSES.inkMuted}`}>
            {isOwner ? dict.catalog.emptyOwnerHint : dict.catalog.emptyVisitorHint}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            {isFiltering && (
              <button type="button" onClick={resetFilters} className={THEME_CLASSES.btnOutline}>
                {dict.catalog.clearFilters}
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
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{dict.catalog.addTeaching}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {leadDiscourse && (
            <DiscourseFeatureCards
              dict={dict}
              leadDiscourse={leadDiscourse}
              secondaryDiscourses={secondaryDiscourses}
              readingTimesById={readingTimesById}
              bookmarks={bookmarks}
              onSelectDiscourse={onSelectDiscourse}
              onSayadawChange={onSayadawChange}
              onToggleBookmark={onToggleBookmark}
              onExportMarkdown={onExportMarkdown}
            />
          )}

          <div className="pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4 border-b border-[var(--ink-primary)]/20">
              <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                {groupBySayadaw ? dict.catalog.catalogueBySayadaw : dict.catalog.completeCatalogue}
              </h3>
              <span className={`font-mono-code text-xs ${THEME_CLASSES.inkSubtle} tabular-nums`}>
                {filtered.length}{' '}
                {filtered.length === 1
                  ? dict.catalog.entriesUnitSingular
                  : dict.catalog.entriesUnitPlural}{' '}
                · {totalStudyMinutes} {dict.catalog.minStudySuffix}
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
                          {group.items.length === 1
                            ? dict.catalog.discourseUnitSingular
                            : dict.catalog.discourseUnitPlural}
                        </span>
                      </div>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => onOpenStoreModal(group.sayadawId)}
                          className={`inline-flex items-center gap-1 text-xs font-medium ${THEME_CLASSES.accentInk} hover:underline underline-offset-4 cursor-pointer`}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{dict.catalog.addUnderSayadaw}</span>
                        </button>
                      )}
                    </div>
                    <div className={THEME_CLASSES.divideHairline}>
                      {group.items.map((d) => (
                        <CatalogueRow
                          key={d.id}
                          dict={dict}
                          discourse={d}
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
                    dict={dict}
                    discourse={d}
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
