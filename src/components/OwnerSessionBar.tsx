import { ExternalLink, LogOut, ShieldCheck, UploadCloud } from 'lucide-react';
import { GITHUB_CONFIG } from '../config/siteConfig';
import { AuthSessionState } from '../plugins/githubPublisher';
import { THEME_CLASSES } from '../theme/uiClasses';

interface OwnerSessionBarProps {
  auth: AuthSessionState;
  hasUnpublishedChanges: boolean;
  pendingDeletionCount: number;
  isPublishing: boolean;
  publishStatus: string | null;
  publishError: string | null;
  lastActionsUrl: string | null;
  onPublishToGitHub: () => void;
  onOpenGitHubStudio: () => void;
  onLogout: () => void;
}

export function OwnerSessionBar({
  auth,
  hasUnpublishedChanges,
  pendingDeletionCount,
  isPublishing,
  publishStatus,
  publishError,
  lastActionsUrl,
  onPublishToGitHub,
  onOpenGitHubStudio,
  onLogout,
}: OwnerSessionBarProps) {
  if (!auth.isOwner) return null;

  const statusText = hasUnpublishedChanges
    ? pendingDeletionCount > 0
      ? `Unpublished local changes (${pendingDeletionCount} removal(s) queued)`
      : 'Unpublished local changes ready'
    : 'Synced with repository';

  return (
    <div className="border-b border-[var(--border-strong)] bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-[1200px] px-4 py-2.5 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className={`flex flex-wrap items-center gap-2.5 ${THEME_CLASSES.inkPrimary}`}>
          <ShieldCheck className={`h-4 w-4 ${THEME_CLASSES.successInk}`} aria-hidden="true" />
          <span className="font-medium">
            Owner:{' '}
            <span className="font-mono-code">@{auth.user?.login || GITHUB_CONFIG.owner}</span>
          </span>
          <span aria-hidden="true" className={THEME_CLASSES.inkSubtle}>
            ·
          </span>
          <span className={THEME_CLASSES.inkMuted}>{statusText}</span>
          {publishStatus && (
            <>
              <span aria-hidden="true" className={THEME_CLASSES.inkSubtle}>
                ·
              </span>
              <span className={`font-mono-code ${THEME_CLASSES.successInk}`}>{publishStatus}</span>
            </>
          )}
          {lastActionsUrl && (
            <a
              href={lastActionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 ${THEME_CLASSES.accentInk} underline`}
            >
              <span>View GitHub Actions</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          {publishError && (
            <span role="alert" className={THEME_CLASSES.dangerInk}>
              {publishError}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPublishToGitHub}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 min-h-[34px] px-3.5 py-1.5 text-xs font-medium bg-[var(--accent-primary)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)] cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isPublishing ? 'Publishing...' : 'Publish to GitHub'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenGitHubStudio}
            className={`min-h-[34px] px-3 py-1.5 text-xs border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer whitespace-nowrap`}
          >
            Manage &amp; Backup
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`inline-flex items-center gap-1 min-h-[34px] px-3 py-1.5 text-xs border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer whitespace-nowrap`}
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
