import {
  DhammaDiscourse,
  GitHubAuthUser,
  GoogleFormTab,
  GroupEvent,
  MeditationTip,
  PublishedContentManifest,
  SayadawProfile,
} from '../types/dhamma';
import { discourseToRst } from './articleLoader';
import { discourseToMarkdown, resolveAssetUrl } from './storageAndExport';
import { getCollectionSlug, getDiscourseSlug, getSayadawSlug } from './urlRouter';

export const GITHUB_OWNER_LOGIN = (import.meta.env.VITE_GITHUB_OWNER as string | undefined) || 'theartofnoting';
export const GITHUB_REPO_SLUG = 'theartofnoting/dhamma_content';
const PAT_SESSION_KEY = 'vipassana_bhavana_owner_pat_v1';
const USER_SESSION_KEY = 'vipassana_bhavana_owner_user_v1';

export interface AuthSessionState {
  isOwner: boolean;
  mode: 'none' | 'oauth' | 'pat';
  user: GitHubAuthUser | null;
  patToken?: string;
}

export function loadSavedPatSession(): AuthSessionState {
  try {
    const pat = sessionStorage.getItem(PAT_SESSION_KEY);
    const rawUser = sessionStorage.getItem(USER_SESSION_KEY);
    if (pat && rawUser) {
      const user = JSON.parse(rawUser) as GitHubAuthUser;
      if (user.login.toLowerCase() === GITHUB_OWNER_LOGIN.toLowerCase()) {
        return { isOwner: true, mode: 'pat', user, patToken: pat };
      }
    }
  } catch {
    // Ignore storage errors
  }
  return { isOwner: false, mode: 'none', user: null };
}

export function savePatSession(token: string, user: GitHubAuthUser): void {
  try {
    sessionStorage.setItem(PAT_SESSION_KEY, token);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  } catch {
    // Ignore
  }
}

export function clearPatSession(): void {
  try {
    sessionStorage.removeItem(PAT_SESSION_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
  } catch {
    // Ignore
  }
}

export async function verifyGitHubPatForOwner(token: string): Promise<GitHubAuthUser> {
  const cleaned = token.trim();
  if (!cleaned) {
    throw new Error('Please paste your GitHub Personal Access Token.');
  }

  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${cleaned}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub rejected this token (HTTP ${res.status}). Check that it is valid and not expired.`);
  }

  const user = (await res.json()) as GitHubAuthUser;
  if (user.login.toLowerCase() !== GITHUB_OWNER_LOGIN.toLowerCase()) {
    throw new Error(
      `Signed in as @${user.login}, but editing is restricted exclusively to repository owner @${GITHUB_OWNER_LOGIN}.`,
    );
  }
  return user;
}

export async function fetchPublishedManifest(): Promise<PublishedContentManifest | null> {
  try {
    const url = `${resolveAssetUrl('data/dhamma-content.json')}?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as PublishedContentManifest;
    if (!data || !Array.isArray(data.discourses)) return null;
    return data;
  } catch {
    return null;
  }
}

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface RepoFileCommit {
  path: string;
  base64Content: string;
  message: string;
}

async function commitFileDirectToGitHub(
  token: string,
  file: RepoFileCommit,
  repoSlug = GITHUB_REPO_SLUG,
): Promise<void> {
  const apiUrl = `https://api.github.com/repos/${repoSlug}/contents/${file.path}`;
  let existingSha: string | undefined;

  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (getRes.ok) {
    const existing = (await getRes.json()) as { sha?: string };
    existingSha = existing.sha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
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
      `Failed to commit ${file.path} (HTTP ${putRes.status}): ${errPayload.message || 'Check token Contents: Read & Write permission.'}`,
    );
  }
}

function extractDataUrlPayload(
  dataUrl: string,
  fallbackBaseName: string,
): { extension: string; base64: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const base64 = match[2];
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'application/pdf': 'pdf',
  };
  return {
    extension: extMap[mime] || fallbackBaseName.split('.').pop() || 'bin',
    base64,
  };
}

export async function publishArchiveToGitHub(params: {
  auth: AuthSessionState;
  discourses: DhammaDiscourse[];
  sayadaws: SayadawProfile[];
  customSayadaws: SayadawProfile[];
  tips: MeditationTip[];
  events: GroupEvent[];
  formTabs: GoogleFormTab[];
  onProgress?: (step: string) => void;
}): Promise<{
  committedFiles: string[];
  updatedDiscourses: DhammaDiscourse[];
  repoActionsUrl: string;
}> {
  const { auth, discourses, sayadaws, customSayadaws, tips, events, formTabs, onProgress } = params;
  if (!auth.isOwner) {
    throw new Error('Owner authentication is required to publish.');
  }

  const filesToCommit: RepoFileCommit[] = [];

  // 1. Convert any browser-uploaded data: URLs into clean public/media/* files
  const cleanedDiscourses: DhammaDiscourse[] = discourses.map((d) => {
    const dSlug = getDiscourseSlug(d);
    const updated = { ...d };

    if (updated.coverImage && updated.coverImage.startsWith('data:')) {
      const parsed = extractDataUrlPayload(updated.coverImage, `${dSlug}-cover.jpg`);
      if (parsed) {
        const mediaRel = `media/${dSlug}-cover.${parsed.extension}`;
        filesToCommit.push({
          path: `public/${mediaRel}`,
          base64Content: parsed.base64,
          message: `Add cover media for ${d.title}`,
        });
        updated.coverImage = mediaRel;
      }
    }

    if (updated.audioReferenceUrl && updated.audioReferenceUrl.startsWith('data:')) {
      const parsed = extractDataUrlPayload(updated.audioReferenceUrl, `${dSlug}-audio.mp3`);
      if (parsed) {
        const mediaRel = `media/${dSlug}-audio.${parsed.extension}`;
        filesToCommit.push({
          path: `public/${mediaRel}`,
          base64Content: parsed.base64,
          message: `Add audio media for ${d.title}`,
        });
        updated.audioReferenceUrl = mediaRel;
      }
    }

    if (updated.mediaItems && updated.mediaItems.length > 0) {
      updated.mediaItems = updated.mediaItems.map((item, idx) => {
        if (!item.url.startsWith('data:')) return item;
        const parsed = extractDataUrlPayload(item.url, `${dSlug}-item-${idx + 1}.bin`);
        if (!parsed) return item;
        const mediaRel = `media/${dSlug}-attachment-${idx + 1}.${parsed.extension}`;
        filesToCommit.push({
          path: `public/${mediaRel}`,
          base64Content: parsed.base64,
          message: `Add attachment media for ${d.title}`,
        });
        return { ...item, url: mediaRel };
      });
    }

    return updated;
  });

  // 2. Write clean .md / .rst source files for user-authored or edited entries
  for (const d of cleanedDiscourses) {
    if (!d.isUserCreated) continue;
    const sSlug = getSayadawSlug(d.sayadawId, sayadaws, d.sayadawName);
    const cSlug = getCollectionSlug(d);
    const dSlug = getDiscourseSlug(d);
    const ext = d.sourceFormat === 'rst' ? 'rst' : 'md';
    const articlePath =
      d.repoPath && d.repoPath.startsWith('articles/')
        ? d.repoPath
        : `articles/${cSlug}/${sSlug}/${dSlug}.${ext}`;

    const contentStr =
      ext === 'rst' ? discourseToRst(d, sayadaws) : discourseToMarkdown(d);

    filesToCommit.push({
      path: articlePath,
      base64Content: utf8ToBase64(contentStr),
      message: `Publish discourse: ${d.title}`,
    });
  }

  // 3. Write runtime manifest public/data/dhamma-content.json so GitHub Pages updates immediately
  const manifest: PublishedContentManifest = {
    version: 1,
    updatedAt: new Date().toISOString(),
    discourses: cleanedDiscourses,
    customSayadaws,
    tips,
    events,
    formTabs,
  };

  filesToCommit.push({
    path: 'public/data/dhamma-content.json',
    base64Content: utf8ToBase64(JSON.stringify(manifest, null, 2)),
    message: `Update published Vipassana Bhavana archive (${cleanedDiscourses.length} discourses)`,
  });

  onProgress?.(`Publishing ${filesToCommit.length} file(s) to ${GITHUB_REPO_SLUG}...`);

  if (auth.mode === 'oauth') {
    const res = await fetch('/api/github/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: filesToCommit }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || `Server publish failed (HTTP ${res.status}).`);
    }
  } else if (auth.mode === 'pat' && auth.patToken) {
    for (let i = 0; i < filesToCommit.length; i++) {
      const f = filesToCommit[i];
      onProgress?.(`Committing (${i + 1}/${filesToCommit.length}): ${f.path}`);
      await commitFileDirectToGitHub(auth.patToken, f);
    }
  } else {
    throw new Error('No active GitHub authentication session found.');
  }

  return {
    committedFiles: filesToCommit.map((f) => f.path),
    updatedDiscourses: cleanedDiscourses,
    repoActionsUrl: `https://github.com/${GITHUB_REPO_SLUG}/actions`,
  };
}
