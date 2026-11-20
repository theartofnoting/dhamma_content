import { ExternalLink, LogOut, ShieldCheck, UploadCloud } from 'lucide-react';
import { AuthSessionState, GITHUB_OWNER_LOGIN } from '../utils/githubPublisher';

interface OwnerSessionBarProps {
  auth: AuthSessionState;
  hasUnpublishedChanges: boolean;
  pendingDeletionCount?: number;
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
  pendingDeletionCount = 0,
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
      ? `Unpublished edits (${pendingDeletionCount} removal${pendingDeletionCount === 1 ? '' : 's'} queued)`
      : 'Unpublished edits ready to commit'
    : 'Synced with repository';

  return (
    <div className="border-b border-[#D6CEBE] dark:border-[#342E28] bg-[#F4EFE6] dark:bg-[#221E1A]">
      <div className="mx-auto max-w-[1200px] px-4 py-2.5 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 text-[#1C1917] dark:text-[#F5F5F4]">
          <ShieldCheck className="h-4 w-4 text-[#14532D] dark:text-[#86EFAC]" aria-hidden="true" />
          <span className="font-medium">
            Owner:{' '}
            <span className="font-mono-code">@{auth.user?.login || GITHUB_OWNER_LOGIN}</span>
          </span>
          <span aria-hidden="true" className="text-[#A8A29E]">
            ·
          </span>
          <span className="text-[#57534E] dark:text-[#A8A29E]">{statusText}</span>
          {publishStatus && (
            <>
              <span aria-hidden="true" className="text-[#A8A29E]">
                ·
              </span>
              <span className="font-mono-code text-[#14532D] dark:text-[#86EFAC]">
                {publishStatus}
              </span>
            </>
          )}
          {lastActionsUrl && (
            <a
              href={lastActionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#9A3412] dark:text-[#FDBA74] underline"
            >
              <span>View GitHub Actions</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          {publishError && (
            <span role="alert" className="text-[#9A3412] dark:text-[#FCA5A5]">
              {publishError}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPublishToGitHub}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 min-h-[34px] px-3.5 py-1.5 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#B45309] dark:hover:bg-[#92400E] cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isPublishing ? 'Publishing...' : 'Publish to GitHub'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGitHubStudio}
            className="min-h-[34px] px-3 py-1.5 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] cursor-pointer whitespace-nowrap"
          >
            Manage &amp; Backup
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1 min-h-[34px] px-3 py-1.5 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
