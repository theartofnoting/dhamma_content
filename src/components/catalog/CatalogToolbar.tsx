import { Bookmark, Layers, Moon, Search, Sun, X } from 'lucide-react';
import { TAXONOMY } from '../../config/siteConfig';
import { LocaleDictionary } from '../../i18n';
import { THEME_CLASSES } from '../../theme/uiClasses';
import {
  DiscourseLanguage,
  SayadawProfile,
  TraditionCollection,
} from '../../types/dhamma';

interface CatalogToolbarProps {
  dict: LocaleDictionary;
  sayadaws: SayadawProfile[];
  bookmarkCount: number;
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
  groupBySayadaw: boolean;
  onToggleGroupBySayadaw: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function CatalogToolbar({
  dict,
  sayadaws,
  bookmarkCount,
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
  groupBySayadaw,
  onToggleGroupBySayadaw,
  darkMode,
  onToggleDarkMode,
}: CatalogToolbarProps) {
  return (
    <div className="py-5 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        <div className="lg:col-span-5 relative">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${THEME_CLASSES.inkSubtle}`}
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={dict.catalog.searchPlaceholder}
            aria-label={dict.catalog.searchPlaceholder}
            className={`w-full min-h-[42px] pl-10 pr-9 py-2 text-sm bg-[var(--surface-input)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} focus:outline-none focus:border-[var(--accent-ink)]`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={dict.catalog.clearFilters}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 ${THEME_CLASSES.inkSubtle} hover:text-[var(--ink-primary)] cursor-pointer`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="lg:col-span-7 flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCollection}
            onChange={(e) => onCollectionChange(e.target.value as TraditionCollection | 'All')}
            aria-label={dict.catalog.allCollections}
            className={`min-h-[42px] px-3 py-2 text-xs font-medium bg-[var(--surface-input)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} focus:outline-none focus:border-[var(--accent-ink)] cursor-pointer`}
          >
            <option value="All">{dict.catalog.allCollections}</option>
            {TAXONOMY.collections.map((c) => (
              <option key={c} value={c}>
                {dict.taxonomyLabels.collections[c]}
              </option>
            ))}
          </select>

          <select
            value={selectedSayadawId}
            onChange={(e) => onSayadawChange(e.target.value)}
            aria-label={dict.catalog.allSayadaws}
            className={`min-h-[42px] px-3 py-2 text-xs font-medium bg-[var(--surface-input)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} focus:outline-none focus:border-[var(--accent-ink)] cursor-pointer`}
          >
            <option value="All">{dict.catalog.allSayadaws}</option>
            {sayadaws.map((s) => (
              <option key={s.id} value={s.id}>
                {s.vietnameseName ? `${s.name} (${s.vietnameseName})` : s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value as DiscourseLanguage | 'All')}
            aria-label={dict.catalog.allLanguages}
            className={`min-h-[42px] px-3 py-2 text-xs font-medium bg-[var(--surface-input)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong} focus:outline-none focus:border-[var(--accent-ink)] cursor-pointer`}
          >
            <option value="All">{dict.catalog.allLanguages}</option>
            {TAXONOMY.languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onToggleOnlySaved}
            className={`inline-flex items-center gap-1.5 min-h-[42px] px-3 py-2 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              onlySaved
                ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-[var(--accent-primary)]'
                : `${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)]`
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">
              {dict.catalog.savedOnly} ({bookmarkCount})
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleGroupBySayadaw}
            className={`inline-flex items-center gap-1.5 min-h-[42px] px-3 py-2 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              groupBySayadaw
                ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)] border-[var(--ink-primary)]'
                : `${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)]`
            }`}
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{dict.catalog.groupBySayadaw}</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? dict.catalog.lightMode : dict.catalog.darkMode}
            className={`inline-flex items-center gap-1.5 min-h-[42px] px-3 py-2 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)] cursor-pointer whitespace-nowrap`}
          >
            {darkMode ? (
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{darkMode ? dict.catalog.lightMode : dict.catalog.darkMode}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
