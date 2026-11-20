import { useState } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  Folder,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import {
  DhammaDiscourse,
  GitHubContentEntry,
  GitHubRepoInfo,
  GroupEvent,
  MeditationTip,
  SayadawProfile,
} from '../types/dhamma';
import {
  fetchGitHubRepoSnapshot,
  GITHUB_PAGES_WORKFLOW_YML,
  triggerFileDownload,
} from '../utils/storageAndExport';

interface GitHubPagesStudioProps {
  sayadaws: SayadawProfile[];
  discourses: DhammaDiscourse[];
  tips: MeditationTip[];
  events: GroupEvent[];
  pendingDeletionCount: number;
  hasUnpublishedChanges: boolean;
  isPublishing: boolean;
  publishStatus: string | null;
  publishError: string | null;
  lastActionsUrl: string | null;
  onPublishToGitHub: () => void;
  onExportMarkdown: (discourse: DhammaDiscourse) => void;
}

const DEFAULT_REPO_SLUG = 'theartofnoting/dhamma_content';
const TARGET_PAGES_URL = 'https://theartofnoting.github.io/dhamma_content/';

export function GitHubPagesStudio({
  sayadaws,
  discourses,
  tips,
  events,
  pendingDeletionCount,
  hasUnpublishedChanges,
  isPublishing,
  publishStatus,
  publishError,
  lastActionsUrl,
  onPublishToGitHub,
  onExportMarkdown,
}: GitHubPagesStudioProps) {
  const [repoSlug, setRepoSlug] = useState(DEFAULT_REPO_SLUG);
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [repoFiles, setRepoFiles] = useState<GitHubContentEntry[]>([]);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const handleFetchRepo = async () => {
    setLoadingRepo(true);
    setRepoError(null);
    try {
      const snapshot = await fetchGitHubRepoSnapshot(repoSlug);
      setRepoInfo(snapshot.repo);
      setRepoFiles(snapshot.contents);
    } catch (err) {
      setRepoError(
        err instanceof Error ? err.message : 'Unable to reach GitHub API right now.',
      );
    } finally {
      setLoadingRepo(false);
    }
  };

  const handleDownloadWorkflow = () => {
    triggerFileDownload('pages.yml', GITHUB_PAGES_WORKFLOW_YML, 'text/yaml;charset=utf-8');
  };

  const handleDownloadArchiveJson = () => {
    const payload = {
      name: 'Vipassana Bhavana — Dhamma Page',
      site: TARGET_PAGES_URL,
      repository: `https://github.com/${repoSlug}`,
      exportedAt: new Date().toISOString(),
      license: 'CC BY-NC-SA 4.0 (Dhamma-dāna)',
      sayadaws,
      discourses,
      meditationTips: tips,
      events,
    };
    triggerFileDownload(
      'dhamma-archive.json',
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8',
    );
  };

  return (
    <section
      id="github-section"
      className="border-t border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16]"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-8 sm:py-16">
        <div className="max-w-3xl space-y-2 pb-10 border-b border-[#E5DFD3] dark:border-[#342E28]">
          <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
            06. Archive Publishing &amp; Backups
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] text-balance">
            Publish &amp; Backup Archive
          </h2>
        </div>

        {/* Publish Changes Card */}
        <div className="mt-8 p-6 border border-[#D6CEBE] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#181512] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
              {repoSlug}
            </p>
            <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
              Sync Browser Edits to GitHub
            </h3>
            <p className="text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E] tabular-nums">
              {sayadaws.length} Sayadaw(s) · {discourses.length} discourse(s) · {tips.length} tip(s) ·{' '}
              {events.length} event(s)
              {pendingDeletionCount > 0 ? ` · ${pendingDeletionCount} file removal(s) queued` : ''}
            </p>
            {publishStatus && (
              <p className="font-mono-code text-xs text-[#14532D] dark:text-[#86EFAC] pt-1">
                {publishStatus}
              </p>
            )}
            {lastActionsUrl && (
              <p className="text-xs pt-1">
                <a
                  href={lastActionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#9A3412] dark:text-[#FDBA74] underline"
                >
                  <span>Monitor GitHub Actions Deployment</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </p>
            )}
            {publishError && (
              <p role="alert" className="text-xs text-[#9A3412] dark:text-[#FCA5A5] pt-1">
                {publishError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onPublishToGitHub}
            disabled={isPublishing}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-sm font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#B45309] dark:hover:bg-[#92400E] cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            <span>
              {isPublishing
                ? 'Committing to GitHub...'
                : hasUnpublishedChanges
                  ? 'Publish Changes Now'
                  : 'Sync Archive to GitHub'}
            </span>
          </button>
        </div>

        <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Export Backups */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
              Export Archive Backups
            </h3>

            <div className="divide-y divide-[#E5DFD3] dark:divide-[#342E28] border-t border-b border-[#E5DFD3] dark:border-[#342E28]">
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono-code text-sm text-[#1C1917] dark:text-[#F5F5F4]">
                    dhamma-archive.json
                  </p>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
                    Backup of {sayadaws.length} sayadaws, {discourses.length} discourses,{' '}
                    {tips.length} tips, and {events.length} events
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadArchiveJson}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917] hover:bg-[#9A3412] dark:hover:bg-[#FDBA74] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Export JSON</span>
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono-code text-sm text-[#1C1917] dark:text-[#F5F5F4]">
                    pages.yml
                  </p>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    GitHub Pages deployment workflow
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadWorkflow}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>pages.yml</span>
                </button>
              </div>
            </div>

            {discourses.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-display text-xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                  Download Individual Discourses
                </h4>
                <div className="divide-y divide-[#E5DFD3] dark:divide-[#342E28] border-t border-b border-[#E5DFD3] dark:border-[#342E28] max-h-60 overflow-y-auto">
                  {discourses.map((d) => (
                    <div key={d.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#1C1917] dark:text-[#F5F5F4] truncate">
                          {d.title}
                        </p>
                        <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] truncate">
                          {d.sayadawName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onExportMarkdown(d)}
                        className="text-xs font-medium text-[#9A3412] dark:text-[#FDBA74] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Download .md
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Live GitHub Repo Inspector */}
          <div className="lg:col-span-6">
            <div className="p-6 border border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#181512] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                    Repository Inspector
                  </h3>
                  <p className="font-mono-code text-xs text-[#78716C] dark:text-[#A8A29E]">
                    github.com/{repoSlug}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFetchRepo}
                  disabled={loadingRepo}
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium border border-[#1C1917] dark:border-[#E7E5E4] text-[#1C1917] dark:text-[#F5F5F4] hover:bg-[#1C1917] hover:text-[#FBF9F5] dark:hover:bg-[#F5F5F4] dark:hover:text-[#1C1917] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${loadingRepo ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span>{loadingRepo ? 'Fetching...' : 'Check Repo Status'}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={repoSlug}
                  onChange={(e) => setRepoSlug(e.target.value)}
                  aria-label="GitHub repository owner/name"
                  className="flex-1 min-h-[38px] px-3 py-1.5 font-mono-code text-xs bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              {repoError && (
                <div
                  role="alert"
                  className="p-3.5 border border-[#9A3412]/40 bg-[#9A3412]/5 text-xs text-[#9A3412] dark:text-[#FCA5A5]"
                >
                  {repoError}
                </div>
              )}

              {repoInfo && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-4 gap-3 py-3 border-t border-b border-[#E5DFD3] dark:border-[#342E28]">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                        Branch
                      </p>
                      <p className="font-mono-code text-sm text-[#1C1917] dark:text-[#F5F5F4]">
                        {repoInfo.default_branch}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                        Pages
                      </p>
                      <p className="font-mono-code text-sm text-[#1C1917] dark:text-[#F5F5F4]">
                        {repoInfo.has_pages ? 'Active' : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                        Stars
                      </p>
                      <p className="font-mono-code text-sm text-[#1C1917] dark:text-[#F5F5F4] tabular-nums">
                        {repoInfo.stargazers_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                        Last Push
                      </p>
                      <p className="font-mono-code text-sm text-[#1C1917] dark:text-[#F5F5F4] tabular-nums">
                        {new Date(repoInfo.pushed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {repoFiles.length > 0 && (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {repoFiles.map((entry) => (
                        <div
                          key={entry.path}
                          className="flex items-center justify-between py-1.5 text-xs border-b border-[#E5DFD3]/60 dark:border-[#342E28]/60"
                        >
                          <span className="inline-flex items-center gap-2 font-mono-code text-[#292524] dark:text-[#E7E5E4]">
                            {entry.type === 'dir' ? (
                              <Folder className="h-3.5 w-3.5 text-[#9A3412] dark:text-[#FDBA74]" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 text-[#78716C]" />
                            )}
                            <span>{entry.name}</span>
                          </span>
                          <span className="font-mono-code text-[11px] text-[#78716C] tabular-nums">
                            {entry.type === 'dir' ? 'dir' : `${entry.size} B`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 flex flex-wrap gap-4 text-xs">
                    <a
                      href={repoInfo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#9A3412] dark:text-[#FDBA74] hover:underline"
                    >
                      <span>{repoInfo.full_name}</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    <a
                      href={TARGET_PAGES_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#44403C] dark:text-[#D6D3D1] hover:underline"
                    >
                      <span>theartofnoting.github.io/dhamma_content</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
