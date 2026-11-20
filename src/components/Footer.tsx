import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { GITHUB_CONFIG, NAV_ITEMS, SITE_CONFIG } from '../config/siteConfig';
import { THEME_CLASSES } from '../theme/uiClasses';
import { NavSection } from '../types/dhamma';

interface FooterProps {
  isOwner: boolean;
  ownerLogin?: string | null;
  onNavigate: (target: NavSection) => void;
  onResetArchive: () => void;
}

export function Footer({ isOwner, ownerLogin, onNavigate, onResetArchive }: FooterProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <footer className={`border-t ${THEME_CLASSES.borderHairline} bg-[var(--surface-footer)]`}>
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <p className={`font-display text-xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
            {SITE_CONFIG.brandTitle} · {SITE_CONFIG.pageTitleSuffix}
          </p>
          <p className={`text-xs leading-relaxed ${THEME_CLASSES.inkMuted}`}>
            Dhamma-dāna Open Repository hosted via GitHub Pages at{' '}
            <span className="font-mono-code">{GITHUB_CONFIG.pagesHost}</span> from{' '}
            <span className="font-mono-code">github.com/{GITHUB_CONFIG.repoSlug}</span>.{' '}
            {SITE_CONFIG.licenseFooter}
          </p>
        </div>

        <div className={`flex flex-wrap items-center gap-5 text-xs ${THEME_CLASSES.inkMuted}`}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="hover:text-[var(--ink-primary)] cursor-pointer"
            >
              {item.label}
            </button>
          ))}

          {isOwner && (
            <button
              type="button"
              onClick={() => onNavigate('github')}
              className="hover:text-[var(--ink-primary)] cursor-pointer"
            >
              GitHub Pages
            </button>
          )}

          <a
            href={GITHUB_CONFIG.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[var(--accent-ink)]"
          >
            <span>{GITHUB_CONFIG.repoSlug}</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="hover:text-[var(--accent-ink)] cursor-pointer font-medium"
          >
            {isOwner ? `Owner: @${ownerLogin || GITHUB_CONFIG.owner}` : 'Owner Login'}
          </button>

          {isOwner && (
            <>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="hover:text-[var(--status-danger)] cursor-pointer"
                >
                  Restore Defaults
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetArchive();
                      setConfirmReset(false);
                    }}
                    className={`${THEME_CLASSES.dangerInk} font-medium underline cursor-pointer`}
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="hover:text-[var(--ink-primary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
