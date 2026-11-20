import { useState } from 'react';
import { ArrowLeft, KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { GitHubAuthUser } from '../types/dhamma';
import {
  AuthSessionState,
  GITHUB_OWNER_LOGIN,
  verifyGitHubPatForOwner,
} from '../utils/githubPublisher';

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
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#E5DFD3] dark:border-[#342E28]">
        <button
          type="button"
          onClick={onBackToArchive}
          className="inline-flex items-center gap-2 min-h-[40px] text-xs font-medium text-[#44403C] dark:text-[#D6D3D1] hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Archive</span>
        </button>

        <span className="font-mono-code text-xs text-[#78716C] dark:text-[#A8A29E]">
          @{GITHUB_OWNER_LOGIN}
        </span>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-4 border border-[#9A3412]/50 bg-[#9A3412]/5 text-xs sm:text-sm text-[#9A3412] dark:text-[#FCA5A5]"
        >
          {errorMsg}
        </div>
      )}

      {auth.isOwner && auth.user ? (
        <div className="p-6 sm:p-8 border border-[#D6CEBE] dark:border-[#342E28] bg-[#F4EFE6]/60 dark:bg-[#1E1A16] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {auth.user.avatar_url && (
                <img
                  src={auth.user.avatar_url}
                  alt={auth.user.login}
                  className="h-12 w-12 border border-[#D6CEBE] dark:border-[#44403C] object-cover"
                />
              )}
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#14532D] dark:text-[#86EFAC]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Owner Session Active</span>
                </p>
                <h1 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                  {auth.user.name || `@${auth.user.login}`}{' '}
                  <span className="font-mono-code text-sm font-normal text-[#78716C] dark:text-[#A8A29E]">
                    @{auth.user.login}
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBackToArchive}
                className="min-h-[42px] px-5 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] cursor-pointer"
              >
                Return to Archive
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#9A3412] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-10 border border-[#D6CEBE] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16] space-y-6">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-1.5 font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Owner Access</span>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
              Sign In with GitHub Token
            </h1>
            <p className="text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
              Enter a GitHub personal access token for{' '}
              <span className="font-mono-code text-[#1C1917] dark:text-[#F5F5F4]">
                @{GITHUB_OWNER_LOGIN}
              </span>{' '}
              to add, edit, and publish archive content.
            </p>
          </div>

          <form onSubmit={handlePatSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="github-pat-input"
                className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]"
              >
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
                className="w-full min-h-[44px] px-3 py-2 font-mono-code text-xs bg-[#FBF9F5] dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <button
              type="submit"
              disabled={patBusy}
              className="w-full min-h-[44px] px-5 py-2.5 text-sm font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#B45309] dark:hover:bg-[#92400E] transition-colors cursor-pointer disabled:opacity-50"
            >
              {patBusy ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
