import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LOCALE_OPTIONS } from '../config/siteConfig';
import { LocaleDictionary } from '../i18n';
import { THEME_CLASSES } from '../theme/uiClasses';
import { SiteLocale } from '../types/dhamma';

interface LanguageSwitcherProps {
  locale: SiteLocale;
  dict: LocaleDictionary;
  onSelectLocale: (locale: SiteLocale) => void;
  align?: 'left' | 'right';
}

export function LanguageSwitcher({
  locale,
  dict,
  onSelectLocale,
  align = 'right',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    LOCALE_OPTIONS.find((opt) => opt.code === locale) || LOCALE_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={dict.meta.languageSwitcherAria}
        className={`inline-flex items-center gap-2 min-h-[38px] px-3 py-1.5 text-xs font-medium border ${THEME_CLASSES.borderStrong} bg-[var(--surface-canvas)] ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]`}
      >
        <Globe className={`h-3.5 w-3.5 ${THEME_CLASSES.accentInk}`} aria-hidden="true" />
        <span className={THEME_CLASSES.inkMuted}>{dict.meta.languageLabel}:</span>
        <span className="font-semibold">{currentOption.nativeLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 ${THEME_CLASSES.inkSubtle} transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={dict.meta.languageSwitcherAria}
          className={`absolute z-40 mt-1.5 min-w-[200px] border ${THEME_CLASSES.borderStrong} bg-[var(--surface-canvas)] shadow-lg py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {LOCALE_OPTIONS.map((opt) => {
            const isSelected = opt.code === locale;
            return (
              <li key={opt.code} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectLocale(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? `bg-[var(--surface-muted)] ${THEME_CLASSES.accentInk} font-semibold`
                      : `${THEME_CLASSES.inkPrimary} hover:bg-[var(--surface-band)]`
                  }`}
                >
                  <span className="flex items-center gap-2.5 whitespace-nowrap">
                    <span className={`font-mono-code text-[11px] ${THEME_CLASSES.inkSubtle}`}>
                      {opt.shortCode}
                    </span>
                    <span>{opt.nativeLabel}</span>
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
