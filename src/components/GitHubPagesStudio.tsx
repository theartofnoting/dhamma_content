import { useState } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  Folder,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import { GITHUB_CONFIG } from '../config/siteConfig';
import {
  buildArchiveBackupPayload,
  buildGitHubPagesWorkflowYml,
} from '../content/exporters';
import { fetchGitHubRepoSnapshot } from '../plugins/githubPublisher';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { triggerFileDownload } from '../tools/fileTools';
import {
  DhammaDiscourse,
  GitHubContentEntry,
  GitHubRepoInfo,
  GroupEvent,
  MeditationTip,
  SayadawProfile,
} from '../types/dhamma';

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
  const [repoSlug, setRepoSlug] = useState<string>(GITHUB_CONFIG.repoSlug);
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
    triggerFileDownload('pages.yml', buildGitHubPagesWorkflowYml(), 'text/yaml;charset=utf-8');
  };

  const handleDownloadArchiveJson = () => {
    const payload = buildArchiveBackupPayload({
      repoSlug,
      sayadaws,
      discourses,
      tips,
      events,
    });
    triggerFileDownload(
      'dhamma-archive.json',
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8',
    );
  };

  return (
    <section id="github-section" className={THEME_CLASSES.band}>
      <div className={THEME_CLASSES.sectionContainer}>
        <SectionHeader
          kicker="06. Archive Publishing & Backups"
          title="Publish & Backup Archive"
          bottomPaddingClassName="pb-10"
        />

        {/* Publish Changes Card */}
        <div
          className={`mt-8 p-6 ${THEME_CLASSES.cardElevated} flex flex-col md:flex-row md:items-center justify-between gap-6`}
        >
          <div className="space-y-1.5 max-w-2xl">
            <p className={`font-mono-code text-xs ${THEME_CLASSES.accentInk}`}>{repoSlug}</p>
            <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
              Sync Browser Edits to GitHub
            </h3>
            <p className={`text-xs leading-relaxed ${THEME_CLASSES.inkMuted} tabular-nums`}>
              {sayadaws.length} Sayadaw(s) · {discourses.length} discourse(s) · {tips.length} tip(s) ·{' '}
              {events.length} event(s)
              {pendingDeletionCount > 0 ? ` · ${pendingDeletionCount} file removal(s) queued` : ''}
            </p>
            {publishStatus && (
              <p className={`font-mono-code text-xs ${THEME_CLASSES.successInk} pt-1`}>
                {publishStatus}
              </p>
            )}
            {lastActionsUrl && (
              <p className="text-xs pt-1">
                <a
                  href={lastActionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 ${THEME_CLASSES.accentInk} underline`}
                >
                  <span>Monitor GitHub Actions Deployment</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </p>
            )}
            {publishError && (
              <p role="alert" className={`text-xs ${THEME_CLASSES.dangerInk} pt-1`}>
                {publishError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onPublishToGitHub}
            disabled={isPublishing}
            className={`${THEME_CLASSES.btnAccent} min-h-[44px] px-6 text-sm`}
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
            <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
              Export Archive Backups
            </h3>

            <div className={`${THEME_CLASSES.divideHairline} border-t border-b ${THEME_CLASSES.borderHairline}`}>
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className={`font-mono-code text-sm ${THEME_CLASSES.inkPrimary}`}>
                    dhamma-archive.json
                  </p>
                  <p className={`text-xs ${THEME_CLASSES.inkMuted} tabular-nums`}>
                    Backup of {sayadaws.length} sayadaws, {discourses.length} discourses,{' '}
                    {tips.length} tips, and {events.length} events
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadArchiveJson}
                  className={THEME_CLASSES.btnPrimary}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Export JSON</span>
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className={`font-mono-code text-sm ${THEME_CLASSES.inkPrimary}`}>pages.yml</p>
                  <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>
                    GitHub Pages deployment workflow
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadWorkflow}
                  className={THEME_CLASSES.btnOutline}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>pages.yml</span>
                </button>
              </div>
            </div>

            {discourses.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className={`font-display text-xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                  Download Individual Discourses
                </h4>
                <div
                  className={`${THEME_CLASSES.divideHairline} border-t border-b ${THEME_CLASSES.borderHairline} max-h-60 overflow-y-auto`}
                >
                  {discourses.map((d) => (
                    <div key={d.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-xs font-medium ${THEME_CLASSES.inkPrimary} truncate`}>
                          {d.title}
                        </p>
                        <p className={`text-[11px] ${THEME_CLASSES.inkSubtle} truncate`}>
                          {d.sayadawName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onExportMarkdown(d)}
                        className={`text-xs font-medium ${THEME_CLASSES.accentInk} hover:underline whitespace-nowrap shrink-0 cursor-pointer`}
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
            <div className={`p-6 border ${THEME_CLASSES.borderHairline} bg-[var(--surface-canvas)] space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                    Repository Inspector
                  </h3>
                  <p className={`font-mono-code text-xs ${THEME_CLASSES.inkSubtle}`}>
                    github.com/{repoSlug}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFetchRepo}
                  disabled={loadingRepo}
                  className={THEME_CLASSES.btnOutline}
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
                  className={THEME_CLASSES.inputMono}
                />
              </div>

              {repoError && (
                <div role="alert" className={THEME_CLASSES.alertError}>
                  {repoError}
                </div>
              )}

              {repoInfo && (
                <div className="space-y-4 pt-2">
                  <div className={`grid grid-cols-4 gap-3 py-3 border-t border-b ${THEME_CLASSES.borderHairline}`}>
                    <div>
                      <p className={`text-[11px] uppercase tracking-wider ${THEME_CLASSES.inkSubtle}`}>
                        Branch
                      </p>
                      <p className={`font-mono-code text-sm ${THEME_CLASSES.inkPrimary}`}>
                        {repoInfo.default_branch}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[11px] uppercase tracking-wider ${THEME_CLASSES.inkSubtle}`}>
                        Pages
                      </p>
                      <p className={`font-mono-code text-sm ${THEME_CLASSES.inkPrimary}`}>
                        {repoInfo.has_pages ? 'Active' : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[11px] uppercase tracking-wider ${THEME_CLASSES.inkSubtle}`}>
                        Stars
                      </p>
                      <p className={`font-mono-code text-sm ${THEME_CLASSES.inkPrimary} tabular-nums`}>
                        {repoInfo.stargazers_count}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[11px] uppercase tracking-wider ${THEME_CLASSES.inkSubtle}`}>
                        Last Push
                      </p>
                      <p className={`font-mono-code text-sm ${THEME_CLASSES.inkPrimary} tabular-nums`}>
                        {new Date(repoInfo.pushed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {repoFiles.length > 0 && (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {repoFiles.map((entry) => (
                        <div
                          key={entry.path}
                          className={`flex items-center justify-between py-1.5 text-xs border-b ${THEME_CLASSES.borderHairline}`}
                        >
                          <span className={`inline-flex items-center gap-2 font-mono-code ${THEME_CLASSES.inkBody}`}>
                            {entry.type === 'dir' ? (
                              <Folder className={`h-3.5 w-3.5 ${THEME_CLASSES.accentInk}`} />
                            ) : (
                              <FileText className={`h-3.5 w-3.5 ${THEME_CLASSES.inkSubtle}`} />
                            )}
                            <span>{entry.name}</span>
                          </span>
                          <span className={`font-mono-code text-[11px] ${THEME_CLASSES.inkSubtle} tabular-nums`}>
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
                      className={`inline-flex items-center gap-1 ${THEME_CLASSES.accentInk} hover:underline`}
                    >
                      <span>{repoInfo.full_name}</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    <a
                      href={GITHUB_CONFIG.pagesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 ${THEME_CLASSES.inkSecondary} hover:underline`}
                    >
                      <span>{GITHUB_CONFIG.pagesHost}</span>
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
