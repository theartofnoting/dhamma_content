import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { GITHUB_CONFIG, NAV_SECTION_LIST, SITE_CONFIG } from '../config/siteConfig';
import { LocaleDictionary } from '../i18n';
import { THEME_CLASSES } from '../theme/uiClasses';
import { NavSection, SiteLocale } from '../types/dhamma';
import { LanguageSwitcher } from './LanguageSwitcher';

interface FooterProps {
  locale: SiteLocale;
  dict: LocaleDictionary;
  isOwner: boolean;
  ownerLogin?: string | null;
  onSelectLocale: (locale: SiteLocale) => void;
  onNavigate: (target: NavSection) => void;
  onResetArchive: () => void;
}

export function Footer({
  locale,
  dict,
  isOwner,
  ownerLogin,
  onSelectLocale,
  onNavigate,
  onResetArchive,
}: FooterProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <footer className={`border-t ${THEME_CLASSES.borderHairline} bg-[var(--surface-footer)]`}>
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <p className={`font-display text-xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
            {SITE_CONFIG.brandTitle}
          </p>
          <p className={`text-xs leading-relaxed ${THEME_CLASSES.inkMuted}`}>
            {dict.footer.subtitle}:{' '}
            <span className="font-mono-code">{GITHUB_CONFIG.pagesHost}</span> ·{' '}
            <span className="font-mono-code">github.com/{GITHUB_CONFIG.repoSlug}</span>.{' '}
            {dict.footer.licenseFooter}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <LanguageSwitcher
            locale={locale}
            dict={dict}
            onSelectLocale={onSelectLocale}
            align="left"
          />

          <div className={`flex flex-wrap items-center gap-4 text-xs ${THEME_CLASSES.inkMuted}`}>
            {NAV_SECTION_LIST.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="hover:text-[var(--ink-primary)] cursor-pointer whitespace-nowrap"
              >
                {dict.nav[item.id]}
              </button>
            ))}

            {isOwner && (
              <button
                type="button"
                onClick={() => onNavigate('github')}
                className="hover:text-[var(--ink-primary)] cursor-pointer whitespace-nowrap"
              >
                {dict.footer.githubPages}
              </button>
            )}

            <a
              href={GITHUB_CONFIG.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[var(--accent-ink)] whitespace-nowrap"
            >
              <span>{GITHUB_CONFIG.repoSlug}</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="hover:text-[var(--accent-ink)] cursor-pointer font-medium whitespace-nowrap"
            >
              {isOwner
                ? `@${ownerLogin || GITHUB_CONFIG.owner}`
                : dict.footer.ownerLogin}
            </button>

            {isOwner && (
              <>
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="hover:text-[var(--status-danger)] cursor-pointer whitespace-nowrap"
                  >
                    {dict.footer.restoreDefaults}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetArchive();
                        setConfirmReset(false);
                      }}
                      className={`${THEME_CLASSES.dangerInk} font-medium underline cursor-pointer whitespace-nowrap`}
                    >
                      {dict.footer.confirmReset}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="hover:text-[var(--ink-primary)] cursor-pointer whitespace-nowrap"
                    >
                      {dict.footer.cancel}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
