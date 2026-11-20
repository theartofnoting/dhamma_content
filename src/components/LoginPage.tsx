import { useState } from 'react';
import { ArrowLeft, KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { GITHUB_CONFIG } from '../config/siteConfig';
import { AuthSessionState, verifyGitHubPatForOwner } from '../plugins/githubPublisher';
import { THEME_CLASSES } from '../theme/uiClasses';
import { GitHubAuthUser } from '../types/dhamma';

interface LoginPageProps {
  auth: AuthSessionState;
  onPatSuccess: (token: string, user: GitHubAuthUser) => void;
  onLogout: () => void;
  onBackToArchive: () => void;
}

export function LoginPage({
  auth,
  onPatSuccess,
  onLogout,
  onBackToArchive,
}: LoginPageProps) {
  const [patInput, setPatInput] = useState('');
  const [patBusy, setPatBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPatBusy(true);
    try {
      const user = await verifyGitHubPatForOwner(patInput);
      const token = patInput.trim();
      setPatInput('');
      onPatSuccess(token, user);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to verify GitHub token.');
    } finally {
      setPatBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-[680px] px-4 py-14 sm:px-8 sm:py-20 space-y-8">
      <div className="space-y-3">
        <button
          type="button"
          onClick={onBackToArchive}
          className={`inline-flex items-center gap-2 text-xs font-medium ${THEME_CLASSES.inkMuted} hover:text-[var(--accent-ink)] cursor-pointer`}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Public Archive</span>
        </button>
        <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
          Owner Administration · {GITHUB_CONFIG.repoSlug}
        </p>
        <h1 className={`font-display text-3xl sm:text-4xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
          Sign In as Archive Owner
        </h1>
        <p className={`text-sm leading-relaxed ${THEME_CLASSES.inkMuted}`}>
          Public visitors can read all Sayadaw discourses, meditation tips, events, and submission
          forms freely. Publishing, editing, and deleting archive records is restricted to{' '}
          <span className="font-mono-code">@{GITHUB_CONFIG.owner}</span>.
        </p>
      </div>

      {auth.isOwner ? (
        <div className={`p-6 sm:p-8 ${THEME_CLASSES.card} space-y-5`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className={`h-6 w-6 ${THEME_CLASSES.successInk}`} aria-hidden="true" />
            <div>
              <p className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                Signed in as @{auth.user?.login || GITHUB_CONFIG.owner}
              </p>
              <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>
                Owner editing and GitHub publishing tools are unlocked for this browser session.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onBackToArchive} className={THEME_CLASSES.btnPrimary}>
              Manage Archive Content
            </button>
            <button type="button" onClick={onLogout} className={THEME_CLASSES.btnOutline}>
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePatSubmit} className={`p-6 sm:p-8 ${THEME_CLASSES.card} space-y-5`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <KeyRound className={`h-4 w-4 ${THEME_CLASSES.accentInk}`} aria-hidden="true" />
              <label htmlFor="owner-pat-input" className={THEME_CLASSES.label}>
                GitHub Personal Access Token (Fine-Grained · Contents: Read &amp; Write)
              </label>
            </div>
            <input
              id="owner-pat-input"
              type="password"
              value={patInput}
              onChange={(e) => setPatInput(e.target.value)}
              placeholder="github_pat_..."
              autoComplete="off"
              className={THEME_CLASSES.inputMono}
            />
            <p className={`text-xs ${THEME_CLASSES.inkMuted} leading-relaxed`}>
              Your token stays strictly in browser session storage and authenticates directly with
              GitHub&apos;s API on <span className="font-mono-code">{GITHUB_CONFIG.repoSlug}</span>.
            </p>
          </div>

          {errorMsg && (
            <div role="alert" className={THEME_CLASSES.alertError}>
              {errorMsg}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={patBusy} className={THEME_CLASSES.btnAccent}>
              {patBusy ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button type="button" onClick={onBackToArchive} className={THEME_CLASSES.btnSecondary}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
