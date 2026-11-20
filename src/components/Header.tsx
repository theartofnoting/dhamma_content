import { NAV_ITEMS, SITE_CONFIG } from '../config/siteConfig';
import { THEME_CLASSES } from '../theme/uiClasses';
import { NavSection } from '../types/dhamma';

interface HeaderProps {
  activeSection: NavSection;
  isOwner: boolean;
  onNavigate: (target: NavSection) => void;
  onOpenStoreModal: () => void;
}

export function Header({ activeSection, isOwner, onNavigate, onOpenStoreModal }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 border-b ${THEME_CLASSES.borderHairline} bg-[var(--surface-canvas)]/95 backdrop-blur-sm`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-4 py-3.5 sm:px-8">
        <button
          type="button"
          onClick={() => onNavigate('discourses')}
          className={`font-display text-xl sm:text-2xl font-semibold tracking-tight ${THEME_CLASSES.inkPrimary} whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]`}
        >
          {SITE_CONFIG.brandTitle}
        </button>

        <nav
          aria-label="Primary navigation"
          className={`hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium ${THEME_CLASSES.inkMuted}`}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)] ${
                  isActive
                    ? `${THEME_CLASSES.inkPrimary} underline decoration-[var(--accent-primary)] decoration-1 underline-offset-8`
                    : 'hover:text-[var(--ink-primary)] hover:underline hover:decoration-[var(--border-strong)] hover:underline-offset-8'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          {isOwner ? (
            <button
              type="button"
              onClick={onOpenStoreModal}
              className="min-h-[40px] px-4 py-2 text-sm font-medium text-[var(--accent-contrast)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
            >
              Store Teaching
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('reader')}
              className="min-h-[40px] px-4 py-2 text-sm font-medium bg-[var(--ink-primary)] text-[var(--surface-canvas)] hover:bg-[var(--accent-primary)] hover:text-[var(--accent-contrast)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
            >
              Reading Room
            </button>
          )}
        </div>
      </div>

      {/* Compact single-row mobile navigation bar */}
      <nav
        aria-label="Mobile navigation"
        className={`flex md:hidden items-center gap-5 overflow-x-auto border-t ${THEME_CLASSES.borderHairline} px-4 py-2 text-xs font-medium ${THEME_CLASSES.inkMuted}`}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[32px] whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? `${THEME_CLASSES.accentInk} underline underline-offset-4`
                  : 'hover:text-[var(--ink-primary)]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
