import { useState } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  Folder,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import { GITHUB_CONFIG, SECTION_IDS } from '../config/siteConfig';
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
  const [repoContents, setRepoContents] = useState<GitHubContentEntry[]>([]);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const handleLoadSnapshot = async () => {
    setLoadingRepo(true);
    setRepoError(null);
    try {
      const snapshot = await fetchGitHubRepoSnapshot(repoSlug);
      setRepoInfo(snapshot.repo);
      setRepoContents(snapshot.contents);
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : 'Unable to fetch repository.');
    } finally {
      setLoadingRepo(false);
    }
  };

  const handleDownloadBackup = () => {
    const payload = buildArchiveBackupPayload({
      repoSlug,
      sayadaws,
      discourses,
      tips,
      events,
    });
    triggerFileDownload(
      'vipassana-bhavana-archive-backup.json',
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8',
    );
  };

  const handleDownloadWorkflow = () => {
    triggerFileDownload('pages.yml', buildGitHubPagesWorkflowYml(), 'text/yaml;charset=utf-8');
  };

  return (
    <section id={SECTION_IDS.github} className={THEME_CLASSES.band}>
      <div className={THEME_CLASSES.sectionContainer}>
        <SectionHeader
          kicker="Owner Publishing & Backup"
          title="GitHub Pages Studio"
          description={`Commit archive.json, Markdown/reStructuredText articles, and media directly to ${GITHUB_CONFIG.repoSlug}.`}
          actions={
            <button
              type="button"
              onClick={onPublishToGitHub}
              disabled={isPublishing}
              className={THEME_CLASSES.btnAccent}
            >
              <UploadCloud className="h-4 w-4" aria-hidden="true" />
              <span>{isPublishing ? 'Publishing...' : 'Publish to GitHub'}</span>
            </button>
          }
        />

        <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <div className={`p-5 ${THEME_CLASSES.card} space-y-4`}>
              <div className="flex items-center justify-between gap-3">
                <p className={THEME_CLASSES.label}>Sync Status</p>
                <span className={`font-mono-code text-xs ${THEME_CLASSES.inkSubtle} tabular-nums`}>
                  {sayadaws.length} sayadaws · {discourses.length} discourses · {tips.length} tips ·{' '}
                  {events.length} events
                </span>
              </div>

              <p className={`text-sm ${THEME_CLASSES.inkSecondary}`}>
                {hasUnpublishedChanges
                  ? `Local draft changes ready (${pendingDeletionCount} file deletion(s) queued).`
                  : 'All local changes are synchronized with the repository.'}
              </p>

              {publishStatus && <div className={THEME_CLASSES.alertInfo}>{publishStatus}</div>}
              {publishError && <div className={THEME_CLASSES.alertError}>{publishError}</div>}
              {lastActionsUrl && (
                <a
                  href={lastActionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${THEME_CLASSES.accentInk} underline`}
                >
                  <span>Inspect GitHub Actions Build</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" onClick={handleDownloadBackup} className={THEME_CLASSES.btnOutline}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Backup JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadWorkflow}
                  className={THEME_CLASSES.btnOutline}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Download pages.yml</span>
                </button>
                {discourses[0] && (
                  <button
                    type="button"
                    onClick={() => onExportMarkdown(discourses[0])}
                    className={THEME_CLASSES.btnOutline}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Sample .md</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className={`p-5 ${THEME_CLASSES.card} space-y-4`}>
              <label className={THEME_CLASSES.label}>Inspect Live GitHub Repository</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={repoSlug}
                  onChange={(e) => setRepoSlug(e.target.value)}
                  className={`flex-1 ${THEME_CLASSES.inputMono}`}
                />
                <button
                  type="button"
                  onClick={handleLoadSnapshot}
                  disabled={loadingRepo}
                  className={THEME_CLASSES.btnPrimary}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${loadingRepo ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span>Fetch</span>
                </button>
              </div>

              {repoError && <div className={THEME_CLASSES.alertError}>{repoError}</div>}

              {repoInfo && (
                <div className={`space-y-3 pt-2 border-t ${THEME_CLASSES.borderHairline}`}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <a
                      href={repoInfo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-mono-code font-medium ${THEME_CLASSES.accentInk} hover:underline`}
                    >
                      {repoInfo.full_name}
                    </a>
                    <span className={`font-mono-code ${THEME_CLASSES.inkSubtle}`}>
                      branch: {repoInfo.default_branch}
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 gap-1.5 text-xs">
                    {repoContents.map((entry) => (
                      <li key={entry.path} className="flex items-center gap-1.5 truncate">
                        {entry.type === 'dir' ? (
                          <Folder className={`h-3.5 w-3.5 ${THEME_CLASSES.accentInk} shrink-0`} />
                        ) : (
                          <FileText className={`h-3.5 w-3.5 ${THEME_CLASSES.inkMuted} shrink-0`} />
                        )}
                        <span className="font-mono-code truncate">{entry.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
