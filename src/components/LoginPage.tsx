import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, FileCode2, KeyRound, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { GitHubAuthUser } from '../types/dhamma';
import {
  AuthSessionState,
  GITHUB_OWNER_LOGIN,
  GITHUB_REPO_SLUG,
  verifyGitHubPatForOwner,
} from '../utils/githubPublisher';

interface LoginPageProps {
  auth: AuthSessionState;
  onOAuthSuccess: (user: GitHubAuthUser) => void;
  onPatSuccess: (token: string, user: GitHubAuthUser) => void;
  onLogout: () => void;
  onBackToArchive: () => void;
}

interface AuthConfigResponse {
  oauthConfigured: boolean;
  ownerLogin: string;
  repoSlug: string;
}

export function LoginPage({
  auth,
  onOAuthSuccess,
  onPatSuccess,
  onLogout,
  onBackToArchive,
}: LoginPageProps) {
  const [serverOAuthAvailable, setServerOAuthAvailable] = useState<boolean | null>(null);
  const [oauthBusy, setOauthBusy] = useState(false);

  const [patInput, setPatInput] = useState('');
  const [patBusy, setPatBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/config')
      .then(async (res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return null;
        return (await res.json()) as AuthConfigResponse;
      })
      .then((cfg) => {
        if (!cancelled) {
          setServerOAuthAvailable(Boolean(cfg?.oauthConfigured));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setServerOAuthAvailable(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const originAllowed =
        event.origin === window.location.origin ||
        event.origin.endsWith('.run.app') ||
        event.origin.startsWith('http://localhost:');
      if (!originAllowed) return;

      const data = event.data as {
        type?: string;
        user?: GitHubAuthUser;
        error?: string;
      } | null;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'OAUTH_AUTH_SUCCESS' && data.user) {
        setOauthBusy(false);
        setErrorMsg(null);
        onOAuthSuccess(data.user);
      } else if (data.type === 'OAUTH_AUTH_ERROR') {
        setOauthBusy(false);
        setErrorMsg(data.error || 'GitHub OAuth authentication failed.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onOAuthSuccess]);

  const handleStartOAuth = async () => {
    setErrorMsg(null);
    setOauthBusy(true);
    try {
      const res = await fetch('/api/auth/url');
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setOauthBusy(false);
        setErrorMsg(
          data.error ||
            'GitHub OAuth is not available on this host. Use the Fine-Grained GitHub Token option below for GitHub Pages.',
        );
        return;
      }

      const popup = window.open(
        data.url,
        'vipassana_bhavana_github_oauth',
        'width=620,height=720,scrollbars=yes,resizable=yes',
      );
      if (!popup) {
        setOauthBusy(false);
        setErrorMsg('Popup was blocked by the browser. Allow popups for this site and try again.');
      }
    } catch {
      setOauthBusy(false);
      setErrorMsg('Unable to contact the OAuth server. Use GitHub Token sign-in on static GitHub Pages.');
    }
  };

  const handlePatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPatBusy(true);
    try {
      const user = await verifyGitHubPatForOwner(patInput);
      setPatInput('');
      onPatSuccess(patInput.trim(), user);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to verify GitHub token.');
    } finally {
      setPatBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1000px] px-4 py-12 sm:px-8 sm:py-16 space-y-10">
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E5DFD3] dark:border-[#342E28]">
        <button
          type="button"
          onClick={onBackToArchive}
          className="inline-flex items-center gap-2 min-h-[40px] text-xs font-medium text-[#44403C] dark:text-[#D6D3D1] hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Vipassana Bhavana Archive</span>
        </button>

        <span className="font-mono-code text-xs text-[#78716C] dark:text-[#A8A29E]">
          Owner Lock · @{GITHUB_OWNER_LOGIN}
        </span>
      </div>

      <div className="space-y-3 max-w-2xl">
        <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
          Repository Maintainer Access
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] text-balance">
          GitHub Owner Sign-In
        </h1>
        <p className="text-sm sm:text-base leading-[1.7] text-[#44403C] dark:text-[#D6D3D1]">
          Public visitors browse Discourses, Sayadaws, Meditation Tips, Events, and Registration
          Forms in read-only mode. Signing in as{' '}
          <span className="font-mono-code text-[#9A3412] dark:text-[#FDBA74]">
            @{GITHUB_OWNER_LOGIN}
          </span>{' '}
          unlocks all in-browser writing, media, event, tip, and form editing tools and lets you
          commit changes straight to{' '}
          <span className="font-mono-code">{GITHUB_REPO_SLUG}</span>.
        </p>
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
                  <span>Owner Editing Unlocked ({auth.mode === 'oauth' ? 'GitHub OAuth' : 'GitHub Token'})</span>
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                  {auth.user.name || `@${auth.user.login}`}{' '}
                  <span className="font-mono-code text-sm font-normal text-[#78716C] dark:text-[#A8A29E]">
                    @{auth.user.login}
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBackToArchive}
                className="min-h-[42px] px-5 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] cursor-pointer"
              >
                Return to Archive &amp; Edit
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Option 1: GitHub Token (Works on GitHub Pages + Preview) */}
          <div className="p-6 sm:p-8 border border-[#D6CEBE] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16] space-y-5">
            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-1.5 font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Recommended for GitHub Pages</span>
              </p>
              <h2 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                Sign In with Fine-Grained GitHub Token
              </h2>
              <p className="text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                Works directly on{' '}
                <span className="font-mono-code">theartofnoting.github.io/dhamma_content</span>{' '}
                with no server secret required. Your token stays in{' '}
                <span className="font-mono-code">sessionStorage</span> only for this browser tab.
              </p>
            </div>

            <form onSubmit={handlePatSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="github-pat-input"
                  className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]"
                >
                  GitHub Personal Access Token (Scoped to dhamma_content)
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
                {patBusy ? 'Verifying with GitHub...' : 'Verify Token & Unlock Editor'}
              </button>
            </form>

            <div className="pt-4 border-t border-[#E5DFD3] dark:border-[#342E28] space-y-2 text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
              <p className="font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                How to create a safe, single-repository token:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  Open{' '}
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#9A3412] dark:text-[#FDBA74] underline"
                  >
                    GitHub Fine-Grained Tokens
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                  .
                </li>
                <li>
                  Under <strong>Repository access</strong>, select <strong>Only select repositories</strong> →{' '}
                  <span className="font-mono-code">theartofnoting/dhamma_content</span>.
                </li>
                <li>
                  Under <strong>Permissions → Repository permissions</strong>, set{' '}
                  <strong>Contents: Read and write</strong>.
                </li>
                <li>Generate token and paste it above whenever you want to publish from your browser.</li>
              </ol>
            </div>
          </div>

          {/* Option 2: Server GitHub OAuth + File Workflow */}
          <div className="space-y-6">
            <div className="p-6 sm:p-8 border border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#181512] space-y-4">
              <div className="space-y-1.5">
                <p className="inline-flex items-center gap-1.5 font-mono-code text-xs text-[#78716C] dark:text-[#A8A29E]">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Server Mode</span>
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                  Sign In with GitHub OAuth
                </h2>
                <p className="text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                  Uses the backend Express OAuth flow when hosted on a Node server with{' '}
                  <span className="font-mono-code">GITHUB_CLIENT_ID</span> and{' '}
                  <span className="font-mono-code">GITHUB_CLIENT_SECRET</span>.
                </p>
              </div>

              {serverOAuthAvailable === false && (
                <div className="p-3.5 border border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                  GitHub OAuth server credentials are not active on this host (expected on static
                  GitHub Pages). Use the Fine-Grained GitHub Token panel on the left to sign in.
                </div>
              )}

              <button
                type="button"
                onClick={handleStartOAuth}
                disabled={oauthBusy || serverOAuthAvailable === false}
                className="w-full min-h-[44px] px-5 py-2.5 text-sm font-medium border border-[#1C1917] dark:border-[#E7E5E4] text-[#1C1917] dark:text-[#F5F5F4] hover:bg-[#1C1917] hover:text-[#FBF9F5] dark:hover:bg-[#F5F5F4] dark:hover:text-[#1C1917] transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {oauthBusy ? 'Waiting for GitHub Authorization...' : 'Continue with GitHub OAuth'}
              </button>
            </div>

            {/* Alternative Git-native Markdown / reStructuredText workflow */}
            <div className="p-6 border border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/30 dark:bg-[#1E1A16]/70 space-y-3">
              <p className="inline-flex items-center gap-1.5 font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
                <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Recommended Workflow</span>
              </p>
              <h3 className="font-display text-xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                Browser Publishing + Direct .md / .rst Files
              </h3>
              <p className="text-xs leading-relaxed text-[#44403C] dark:text-[#D6D3D1]">
                You can write in-browser (which commits{' '}
                <span className="font-mono-code">public/data/dhamma-content.json</span> plus source
                files to GitHub), <strong>and</strong> drop{' '}
                <span className="font-mono-code">.md</span> or{' '}
                <span className="font-mono-code">.rst</span> files directly under{' '}
                <span className="font-mono-code">articles/&lt;collection&gt;/&lt;sayadaw&gt;/</span>{' '}
                in Git. Both render automatically under clean URLs like:
              </p>
              <p className="p-2.5 font-mono-code text-[11px] break-all bg-[#FBF9F5] dark:bg-[#14110F] border border-[#E5DFD3] dark:border-[#342E28] text-[#9A3412] dark:text-[#FDBA74]">
                /ven-mogok/dhamma-talks-by-mogok-sayadaw/pt05-02-stopping-and-contemplation/
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
