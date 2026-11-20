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
    <section className="mx-auto max-w-[680px] px-4 py-12 sm:px-8 sm:py-20 space-y-8">
      <div className={`flex items-center justify-between gap-4 pb-5 border-b ${THEME_CLASSES.borderHairline}`}>
        <button
          type="button"
          onClick={onBackToArchive}
          className={`inline-flex items-center gap-2 min-h-[40px] text-xs font-medium ${THEME_CLASSES.inkSecondary} hover:text-[var(--accent-ink)] cursor-pointer`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Archive</span>
        </button>

        <span className={`font-mono-code text-xs ${THEME_CLASSES.inkSubtle}`}>
          @{GITHUB_CONFIG.owner}
        </span>
      </div>

      {errorMsg && (
        <div role="alert" className={THEME_CLASSES.alertError}>
          {errorMsg}
        </div>
      )}

      {auth.isOwner && auth.user ? (
        <div className={`p-6 sm:p-8 ${THEME_CLASSES.card} space-y-6`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {auth.user.avatar_url && (
                <img
                  src={auth.user.avatar_url}
                  alt={auth.user.login}
                  className={`h-12 w-12 border ${THEME_CLASSES.borderStrong} object-cover`}
                />
              )}
              <div>
                <p className={`inline-flex items-center gap-1.5 text-xs font-mono-code ${THEME_CLASSES.successInk}`}>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Owner Session Active</span>
                </p>
                <h1 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                  {auth.user.name || `@${auth.user.login}`}{' '}
                  <span className={`font-mono-code text-sm font-normal ${THEME_CLASSES.inkSubtle}`}>
                    @{auth.user.login}
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={onBackToArchive} className={THEME_CLASSES.btnPrimary}>
                Return to Archive
              </button>
              <button type="button" onClick={onLogout} className={THEME_CLASSES.btnSecondary}>
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-6 sm:p-10 ${THEME_CLASSES.card} space-y-6`}>
          <div className="space-y-2">
            <p className={`inline-flex items-center gap-1.5 font-mono-code text-xs ${THEME_CLASSES.accentInk}`}>
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Owner Access</span>
            </p>
            <h1 className={`font-display text-3xl sm:text-4xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
              Sign In with GitHub Token
            </h1>
            <p className={`text-sm leading-relaxed ${THEME_CLASSES.inkMuted}`}>
              Enter a GitHub personal access token for{' '}
              <span className={`font-mono-code ${THEME_CLASSES.inkPrimary}`}>
                @{GITHUB_CONFIG.owner}
              </span>{' '}
              to add, edit, and publish archive content.
            </p>
          </div>

          <form onSubmit={handlePatSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="github-pat-input" className={THEME_CLASSES.label}>
                GitHub Token
              </label>
              <input
                id="github-pat-input"
                type="password"
                required
                autoComplete="off"
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                placeholder="github_pat_..."
                className={THEME_CLASSES.inputMono}
              />
            </div>

            <button
              type="submit"
              disabled={patBusy}
              className={`${THEME_CLASSES.btnAccent} w-full min-h-[44px] text-sm`}
            >
              {patBusy ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
