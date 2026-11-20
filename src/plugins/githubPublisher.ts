import { GITHUB_CONFIG, SITE_CONFIG, STORAGE_KEYS } from '../config/siteConfig';
import { discourseToRst } from '../content/articleLoader';
import { discourseToMarkdown } from '../content/exporters';
import { utf8ToBase64 } from '../tools/fileTools';
import { getCollectionSlug, getDiscourseSlug, getSayadawSlug } from '../tools/slugify';
import {
  DhammaDiscourse,
  GitHubAuthUser,
  GitHubContentEntry,
  GitHubRepoInfo,
  GoogleFormTab,
  GroupEvent,
  MeditationTip,
  PublishedContentManifest,
  SayadawProfile,
} from '../types/dhamma';

export interface AuthSessionState {
  isOwner: boolean;
  mode: 'none' | 'pat';
  user: GitHubAuthUser | null;
  patToken?: string;
}

export function loadSavedPatSession(): AuthSessionState {
  try {
    const pat = sessionStorage.getItem(STORAGE_KEYS.patSession);
    const rawUser = sessionStorage.getItem(STORAGE_KEYS.userSession);
    if (pat && rawUser) {
      const user = JSON.parse(rawUser) as GitHubAuthUser;
      if (user.login.toLowerCase() === GITHUB_CONFIG.owner.toLowerCase()) {
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
    sessionStorage.setItem(STORAGE_KEYS.patSession, token);
    sessionStorage.setItem(STORAGE_KEYS.userSession, JSON.stringify(user));
  } catch {
    // Ignore
  }
}

export function clearPatSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.patSession);
    sessionStorage.removeItem(STORAGE_KEYS.userSession);
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
    throw new Error(
      `GitHub rejected this token (HTTP ${res.status}). Check that it is valid and not expired.`,
    );
  }

  const user = (await res.json()) as GitHubAuthUser;
  if (user.login.toLowerCase() !== GITHUB_CONFIG.owner.toLowerCase()) {
    throw new Error(
      `Signed in as @${user.login}, but editing is restricted exclusively to @${GITHUB_CONFIG.owner}.`,
    );
  }
  return user;
}

export async function fetchGitHubRepoSnapshot(
  repoSlug: string = GITHUB_CONFIG.repoSlug,
): Promise<{
  repo: GitHubRepoInfo;
  contents: GitHubContentEntry[];
}> {
  const cleanSlug = repoSlug
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '');

  const repoRes = await fetch(`https://api.github.com/repos/${cleanSlug}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!repoRes.ok) {
    throw new Error(`GitHub API responded with status ${repoRes.status} for ${cleanSlug}`);
  }
  const repo = (await repoRes.json()) as GitHubRepoInfo;

  let contents: GitHubContentEntry[] = [];
  const contentsRes = await fetch(`https://api.github.com/repos/${cleanSlug}/contents`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (contentsRes.ok) {
    const rawContents = await contentsRes.json();
    if (Array.isArray(rawContents)) {
      contents = rawContents.slice(0, 18) as GitHubContentEntry[];
    }
  }

  return { repo, contents };
}

interface RepoFileCommit {
  path: string;
  base64Content: string;
  message: string;
}

async function commitFileDirectToGitHub(
  token: string,
  file: RepoFileCommit,
  repoSlug: string = GITHUB_CONFIG.repoSlug,
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

async function deleteFileDirectFromGitHub(
  token: string,
  filePath: string,
  repoSlug: string = GITHUB_CONFIG.repoSlug,
): Promise<boolean> {
  const cleanPath = filePath.replace(/^\/+/, '');
  if (!cleanPath.startsWith('content/')) return false;

  const apiUrl = `https://api.github.com/repos/${repoSlug}/contents/${cleanPath}`;
  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (getRes.status === 404) {
    return false;
  }
  if (!getRes.ok) {
    throw new Error(`Unable to check ${cleanPath} on GitHub (HTTP ${getRes.status}).`);
  }

  const existing = (await getRes.json()) as { sha?: string };
  if (!existing.sha) return false;

  const delRes = await fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Remove ${cleanPath}`,
      sha: existing.sha,
    }),
  });

  if (!delRes.ok && delRes.status !== 404) {
    const errPayload = (await delRes.json().catch(() => ({}))) as { message?: string };
    throw new Error(
      `Failed to delete ${cleanPath} (HTTP ${delRes.status}): ${errPayload.message || 'Unknown error'}`,
    );
  }
  return true;
}

const MIME_EXTENSIONS: Record<string, string> = {
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

function extractDataUrlPayload(
  dataUrl: string,
  fallbackBaseName: string,
): { extension: string; base64: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  return {
    extension: MIME_EXTENSIONS[mime] || fallbackBaseName.split('.').pop() || 'bin',
    base64: match[2],
  };
}

export function collectDiscourseMediaPaths(d: DhammaDiscourse): string[] {
  const paths: string[] = [];
  const candidates = [
    d.coverImage,
    d.audioReferenceUrl,
    ...(d.mediaItems?.map((m) => m.url) || []),
  ];
  for (const c of candidates) {
    if (!c) continue;
    const clean = c.trim().replace(/^\/+/, '');
    if (clean.startsWith(`${GITHUB_CONFIG.mediaRoot}/`)) {
      paths.push(clean);
    }
  }
  return paths;
}

export async function publishArchiveToGitHub(params: {
  auth: AuthSessionState;
  discourses: DhammaDiscourse[];
  sayadaws: SayadawProfile[];
  deletedPaths: string[];
  tips: MeditationTip[];
  events: GroupEvent[];
  formTabs: GoogleFormTab[];
  onProgress?: (step: string) => void;
}): Promise<{
  committedFiles: string[];
  deletedFiles: string[];
  updatedDiscourses: DhammaDiscourse[];
  updatedSayadaws: SayadawProfile[];
  repoActionsUrl: string;
}> {
  const { auth, discourses, sayadaws, deletedPaths, tips, events, formTabs, onProgress } = params;
  if (!auth.isOwner || !auth.patToken) {
    throw new Error('GitHub Token authentication is required to publish.');
  }

  const filesToCommit: RepoFileCommit[] = [];

  const cleanedSayadaws: SayadawProfile[] = sayadaws.map((s) => {
    const sSlug = s.slug || s.id;
    if (s.imageUrl && s.imageUrl.startsWith('data:')) {
      const parsed = extractDataUrlPayload(s.imageUrl, `${sSlug}-portrait.jpg`);
      if (parsed) {
        const mediaPath = `${GITHUB_CONFIG.mediaRoot}/sayadaw-${sSlug}.${parsed.extension}`;
        filesToCommit.push({
          path: mediaPath,
          base64Content: parsed.base64,
          message: `Add portrait media for ${s.name}`,
        });
        return { ...s, imageUrl: mediaPath };
      }
    }
    return s;
  });

  const cleanedDiscourses: DhammaDiscourse[] = discourses.map((d) => {
    const sSlug = getSayadawSlug(d.sayadawId, cleanedSayadaws, d.sayadawName);
    const cSlug = getCollectionSlug(d);
    const dSlug = getDiscourseSlug(d);
    const ext = d.sourceFormat === 'rst' ? 'rst' : 'md';
    const canonicalArticlePath =
      d.repoPath && d.repoPath.startsWith(`${GITHUB_CONFIG.articlesRoot}/`)
        ? d.repoPath
        : `${GITHUB_CONFIG.articlesRoot}/${cSlug}/${sSlug}/${dSlug}.${ext}`;

    const updated: DhammaDiscourse = {
      ...d,
      repoPath: canonicalArticlePath,
      isUserCreated: false,
    };

    if (updated.coverImage && updated.coverImage.startsWith('data:')) {
      const parsed = extractDataUrlPayload(updated.coverImage, `${dSlug}-cover.jpg`);
      if (parsed) {
        const mediaPath = `${GITHUB_CONFIG.mediaRoot}/${dSlug}-cover.${parsed.extension}`;
        filesToCommit.push({
          path: mediaPath,
          base64Content: parsed.base64,
          message: `Add cover media for ${d.title}`,
        });
        updated.coverImage = mediaPath;
      }
    }

    if (updated.audioReferenceUrl && updated.audioReferenceUrl.startsWith('data:')) {
      const parsed = extractDataUrlPayload(updated.audioReferenceUrl, `${dSlug}-audio.mp3`);
      if (parsed) {
        const mediaPath = `${GITHUB_CONFIG.mediaRoot}/${dSlug}-audio.${parsed.extension}`;
        filesToCommit.push({
          path: mediaPath,
          base64Content: parsed.base64,
          message: `Add audio media for ${d.title}`,
        });
        updated.audioReferenceUrl = mediaPath;
      }
    }

    if (updated.mediaItems && updated.mediaItems.length > 0) {
      updated.mediaItems = updated.mediaItems.map((item, idx) => {
        if (!item.url.startsWith('data:')) return item;
        const parsed = extractDataUrlPayload(item.url, `${dSlug}-item-${idx + 1}.bin`);
        if (!parsed) return item;
        const mediaPath = `${GITHUB_CONFIG.mediaRoot}/${dSlug}-attachment-${idx + 1}.${parsed.extension}`;
        filesToCommit.push({
          path: mediaPath,
          base64Content: parsed.base64,
          message: `Add attachment media for ${d.title}`,
        });
        return { ...item, url: mediaPath };
      });
    }

    return updated;
  });

  for (const d of cleanedDiscourses) {
    const ext = d.sourceFormat === 'rst' || d.repoPath.endsWith('.rst') ? 'rst' : 'md';
    const contentStr =
      ext === 'rst' ? discourseToRst(d, cleanedSayadaws) : discourseToMarkdown(d);

    filesToCommit.push({
      path: d.repoPath,
      base64Content: utf8ToBase64(contentStr),
      message: `Publish discourse: ${d.title}`,
    });
  }

  const commitPathSet = new Set(filesToCommit.map((f) => f.path));
  const activeMediaAndArticleRefs = new Set<string>();
  for (const d of cleanedDiscourses) {
    activeMediaAndArticleRefs.add(d.repoPath);
    for (const m of collectDiscourseMediaPaths(d)) {
      activeMediaAndArticleRefs.add(m);
    }
  }
  for (const s of cleanedSayadaws) {
    if (s.imageUrl?.startsWith(`${GITHUB_CONFIG.mediaRoot}/`)) {
      activeMediaAndArticleRefs.add(s.imageUrl);
    }
  }

  const pathsToDelete = Array.from(new Set(deletedPaths))
    .map((p) => p.replace(/^\/+/, ''))
    .filter(
      (p) =>
        p.startsWith('content/') &&
        p !== GITHUB_CONFIG.manifestPath &&
        !commitPathSet.has(p) &&
        !activeMediaAndArticleRefs.has(p),
    );

  const manifest: PublishedContentManifest = {
    version: 1,
    updatedAt: new Date().toISOString(),
    sayadaws: cleanedSayadaws,
    discourses: cleanedDiscourses,
    deletedPaths: pathsToDelete,
    tips,
    events,
    formTabs,
  };

  filesToCommit.push({
    path: GITHUB_CONFIG.manifestPath,
    base64Content: utf8ToBase64(JSON.stringify(manifest, null, 2)),
    message: `Update ${SITE_CONFIG.brandTitle} archive (${cleanedSayadaws.length} sayadaws, ${cleanedDiscourses.length} discourses)`,
  });

  const totalOps = filesToCommit.length + pathsToDelete.length;
  let opIndex = 0;

  for (const f of filesToCommit) {
    opIndex += 1;
    onProgress?.(`Saving (${opIndex}/${totalOps}): ${f.path}`);
    await commitFileDirectToGitHub(auth.patToken, f);
  }

  const deletedFiles: string[] = [];
  for (const delPath of pathsToDelete) {
    opIndex += 1;
    onProgress?.(`Removing (${opIndex}/${totalOps}): ${delPath}`);
    const removed = await deleteFileDirectFromGitHub(auth.patToken, delPath);
    if (removed) deletedFiles.push(delPath);
  }

  return {
    committedFiles: filesToCommit.map((f) => f.path),
    deletedFiles,
    updatedDiscourses: cleanedDiscourses,
    updatedSayadaws: cleanedSayadaws,
    repoActionsUrl: GITHUB_CONFIG.actionsUrl,
  };
}
