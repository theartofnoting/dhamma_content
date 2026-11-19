import 'dotenv/config';
import crypto from 'crypto';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const OWNER_LOGIN = (process.env.GITHUB_OWNER || 'theartofnoting').trim();
const REPO_SLUG = 'theartofnoting/dhamma_content';
const SESSION_COOKIE_NAME = 'vb_gh_session';
const STATE_COOKIE_NAME = 'vb_gh_oauth_state';
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.GITHUB_CLIENT_SECRET ||
  crypto.randomBytes(32).toString('hex');

interface GitHubUserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

interface SessionPayload {
  user: GitHubUserProfile;
  accessToken: string;
  exp: number;
}

function getAppUrl(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const proto =
    (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() ||
    req.protocol ||
    'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`.replace(/\/+$/, '');
}

function isHttpsRequest(req: Request): boolean {
  const appUrl = process.env.APP_URL || '';
  const xfProto = (req.headers['x-forwarded-proto'] as string | undefined) || '';
  return req.secure || xfProto.includes('https') || appUrl.startsWith('https://');
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(val);
    } catch {
      result[key] = val;
    }
  }
  return result;
}

function signToken(payload: object): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json, 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken<T>(token: string | undefined): T | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as T & {
      exp?: number;
    };
    if (parsed.exp && Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCookieHeader(
  res: Response,
  name: string,
  value: string,
  maxAgeSeconds: number,
  https: boolean,
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${maxAgeSeconds}`,
    https ? 'SameSite=None; Secure' : 'SameSite=Lax',
  ];
  res.append('Set-Cookie', parts.join('; '));
}

function clearCookieHeader(res: Response, name: string, https: boolean) {
  const parts = [
    `${name}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    https ? 'SameSite=None; Secure' : 'SameSite=Lax',
  ];
  res.append('Set-Cookie', parts.join('; '));
}

function renderPopupCallbackHtml(message: {
  type: 'OAUTH_AUTH_SUCCESS' | 'OAUTH_AUTH_ERROR';
  user?: GitHubUserProfile;
  error?: string;
}): string {
  const safeJson = JSON.stringify(message).replace(/</g, '\\u003c');
  const titleText =
    message.type === 'OAUTH_AUTH_SUCCESS'
      ? 'GitHub Authentication Complete'
      : 'Authentication Denied';
  const bodyText =
    message.type === 'OAUTH_AUTH_SUCCESS'
      ? `Signed in as @${message.user?.login || OWNER_LOGIN}. Returning to Vipassana Bhavana...`
      : message.error || 'Unable to sign in with GitHub.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${titleText}</title>
  <style>
    body { font-family: Georgia, serif; background: #FBF9F5; color: #1C1917; padding: 3rem 2rem; text-align: center; }
    .box { max-width: 440px; margin: 0 auto; border: 1px solid #D6CEBE; padding: 2rem; background: #F4EFE6; }
    h1 { font-size: 1.4rem; margin: 0 0 0.75rem; }
    p { font-size: 0.95rem; line-height: 1.6; color: #44403C; }
  </style>
</head>
<body>
  <div class="box">
    <h1>${titleText}</h1>
    <p>${bodyText.replace(/</g, '&lt;')}</p>
  </div>
  <script>
    (function () {
      var payload = ${safeJson};
      if (window.opener) {
        window.opener.postMessage(payload, '*');
      }
      setTimeout(function () {
        window.close();
      }, 450);
    })();
  </script>
</body>
</html>`;
}

async function commitFileToGitHub(
  accessToken: string,
  file: { path: string; base64Content: string; message: string },
) {
  const apiUrl = `https://api.github.com/repos/${REPO_SLUG}/contents/${file.path}`;
  let existingSha: string | undefined;

  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'vipassana-bhavana-dhamma-archive',
    },
  });
  if (getRes.ok) {
    const existing = (await getRes.json()) as { sha?: string };
    existingSha = existing.sha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'vipassana-bhavana-dhamma-archive',
    },
    body: JSON.stringify({
      message: file.message,
      content: file.base64Content,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  if (!putRes.ok) {
    const errPayload = (await putRes.json().catch(() => ({}))) as { message?: string };
    throw new Error(
      `GitHub rejected ${file.path} (HTTP ${putRes.status}): ${errPayload.message || 'Unknown error'}`,
    );
  }
}

async function createServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/auth/config', (_req, res) => {
    const oauthConfigured = Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
    );
    res.json({
      oauthConfigured,
      ownerLogin: OWNER_LOGIN,
      repoSlug: REPO_SLUG,
    });
  });

  app.get('/api/auth/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.status(501).json({
        error:
          'GitHub OAuth credentials (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET) are not configured on this server.',
      });
      return;
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const state = signToken({ nonce, exp: Date.now() + 10 * 60 * 1000 });
    const https = isHttpsRequest(req);
    setCookieHeader(res, STATE_COOKIE_NAME, nonce, 600, https);

    const redirectUri = `${getAppUrl(req)}/auth/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo read:user',
      state,
      allow_signup: 'false',
    });

    res.json({
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    });
  });

  const handleOAuthCallback = async (req: Request, res: Response) => {
    const https = isHttpsRequest(req);
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
    const oauthError = typeof req.query.error === 'string' ? req.query.error : '';

    if (oauthError) {
      clearCookieHeader(res, STATE_COOKIE_NAME, https);
      res.status(400).send(
        renderPopupCallbackHtml({
          type: 'OAUTH_AUTH_ERROR',
          error: `GitHub returned: ${oauthError}`,
        }),
      );
      return;
    }

    const verifiedState = verifyToken<{ nonce: string; exp: number }>(stateParam);
    const cookies = parseCookies(req);
    clearCookieHeader(res, STATE_COOKIE_NAME, https);

    if (!verifiedState || (cookies[STATE_COOKIE_NAME] && cookies[STATE_COOKIE_NAME] !== verifiedState.nonce)) {
      res.status(400).send(
        renderPopupCallbackHtml({
          type: 'OAUTH_AUTH_ERROR',
          error: 'OAuth state verification failed or expired. Please try signing in again.',
        }),
      );
      return;
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret || !code) {
      res.status(400).send(
        renderPopupCallbackHtml({
          type: 'OAUTH_AUTH_ERROR',
          error: 'Missing OAuth code or GitHub OAuth app configuration.',
        }),
      );
      return;
    }

    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${getAppUrl(req)}/auth/callback`,
        }),
      });

      const tokenJson = (await tokenRes.json()) as {
        access_token?: string;
        error_description?: string;
        error?: string;
      };

      if (!tokenRes.ok || !tokenJson.access_token) {
        res.status(401).send(
          renderPopupCallbackHtml({
            type: 'OAUTH_AUTH_ERROR',
            error: tokenJson.error_description || tokenJson.error || 'Failed to obtain GitHub token.',
          }),
        );
        return;
      }

      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenJson.access_token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'vipassana-bhavana-dhamma-archive',
        },
      });

      if (!userRes.ok) {
        res.status(401).send(
          renderPopupCallbackHtml({
            type: 'OAUTH_AUTH_ERROR',
            error: 'Could not read GitHub user profile.',
          }),
        );
        return;
      }

      const ghUser = (await userRes.json()) as GitHubUserProfile;
      if (ghUser.login.toLowerCase() !== OWNER_LOGIN.toLowerCase()) {
        clearCookieHeader(res, SESSION_COOKIE_NAME, https);
        res.status(403).send(
          renderPopupCallbackHtml({
            type: 'OAUTH_AUTH_ERROR',
            error: `Signed in as @${ghUser.login}, but editing is locked exclusively to @${OWNER_LOGIN}.`,
          }),
        );
        return;
      }

      const sessionUser: GitHubUserProfile = {
        login: ghUser.login,
        name: ghUser.name,
        avatar_url: ghUser.avatar_url,
        html_url: ghUser.html_url,
      };

      const signedSession = signToken({
        user: sessionUser,
        accessToken: tokenJson.access_token,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      } satisfies SessionPayload);

      setCookieHeader(res, SESSION_COOKIE_NAME, signedSession, 7 * 24 * 60 * 60, https);

      res.send(
        renderPopupCallbackHtml({
          type: 'OAUTH_AUTH_SUCCESS',
          user: sessionUser,
        }),
      );
    } catch (err) {
      res.status(500).send(
        renderPopupCallbackHtml({
          type: 'OAUTH_AUTH_ERROR',
          error: err instanceof Error ? err.message : 'Unexpected OAuth exchange error.',
        }),
      );
    }
  };

  app.get(['/auth/callback', '/auth/callback/'], handleOAuthCallback);

  app.get('/api/auth/me', (req, res) => {
    const cookies = parseCookies(req);
    const session = verifyToken<SessionPayload>(cookies[SESSION_COOKIE_NAME]);
    if (!session || session.user.login.toLowerCase() !== OWNER_LOGIN.toLowerCase()) {
      res.json({ authenticated: false, isOwner: false, user: null });
      return;
    }
    res.json({
      authenticated: true,
      isOwner: true,
      user: session.user,
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    clearCookieHeader(res, SESSION_COOKIE_NAME, isHttpsRequest(req));
    res.json({ ok: true });
  });

  app.post('/api/github/publish', async (req, res) => {
    const cookies = parseCookies(req);
    const session = verifyToken<SessionPayload>(cookies[SESSION_COOKIE_NAME]);
    if (!session || session.user.login.toLowerCase() !== OWNER_LOGIN.toLowerCase()) {
      res.status(401).json({
        error: `Owner authentication as @${OWNER_LOGIN} is required to publish.`,
      });
      return;
    }

    const files = Array.isArray(req.body?.files)
      ? (req.body.files as { path: string; base64Content: string; message: string }[])
      : [];

    if (files.length === 0) {
      res.status(400).json({ error: 'No files provided to publish.' });
      return;
    }

    try {
      for (const file of files) {
        if (!file.path || !file.base64Content) continue;
        await commitFileToGitHub(session.accessToken, file);
      }
      res.json({
        ok: true,
        committedCount: files.length,
        repoSlug: REPO_SLUG,
      });
    } catch (err) {
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Failed to commit changes to GitHub.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vipassana Bhavana server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
