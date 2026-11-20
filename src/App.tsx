import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  INITIAL_FORM_TABS,
  INITIAL_GROUP_EVENTS,
  INITIAL_MEDITATION_TIPS,
} from './data/communitySeed';
import {
  DhammaDiscourse,
  DiscourseLanguage,
  GitHubAuthUser,
  GoogleFormTab,
  GroupEvent,
  MeditationTip,
  NavSection,
  ReaderPreferences,
  SayadawProfile,
  TraditionCollection,
} from './types/dhamma';
import {
  buildIndexedSayadaws,
  clearAllStoredArchive,
  discourseToMarkdown,
  loadBookmarks,
  loadReaderPrefs,
  loadStoredCustomSayadaws,
  loadStoredDeletedPaths,
  loadStoredDiscourses,
  loadStoredEvents,
  loadStoredFormTabs,
  loadStoredTips,
  saveBookmarks,
  saveReaderPrefs,
  saveStoredCustomSayadaws,
  saveStoredDeletedPaths,
  saveStoredDiscourses,
  saveStoredEvents,
  saveStoredFormTabs,
  saveStoredTips,
  triggerFileDownload,
} from './utils/storageAndExport';
import { loadBundledArticleDiscourses } from './utils/articleLoader';
import {
  AuthSessionState,
  clearPatSession,
  collectDiscourseMediaPaths,
  fetchPublishedManifest,
  loadSavedPatSession,
  publishArchiveToGitHub,
  savePatSession,
} from './utils/githubPublisher';
import {
  buildDiscoursePath,
  buildHomePath,
  buildLoginPath,
  buildSayadawPath,
  getSayadawSlug,
  parseAppRoute,
} from './utils/urlRouter';
import { Header } from './components/Header';
import { OwnerSessionBar } from './components/OwnerSessionBar';
import { HeroSection } from './components/HeroSection';
import { DiscourseCatalog } from './components/DiscourseCatalog';
import { SayadawDirectory } from './components/SayadawDirectory';
import { MeditationTipsSection } from './components/MeditationTipsSection';
import { EventsCalendarSection } from './components/EventsCalendarSection';
import { FormsEmbedSection } from './components/FormsEmbedSection';
import { ReadingRoom } from './components/ReadingRoom';
import { GitHubPagesStudio } from './components/GitHubPagesStudio';
import { StoreTeachingModal } from './components/StoreTeachingModal';
import { LoginPage } from './components/LoginPage';
import { Footer } from './components/Footer';

const DRAFT_DIRTY_KEY = 'vipassana_bhavana_dirty_draft_v1';

function mergeDiscourseSources(
  primary: DhammaDiscourse[],
  secondary: DhammaDiscourse[],
): DhammaDiscourse[] {
  const result = [...primary];
  const seenIds = new Set(primary.map((d) => d.id));
  const seenSlugs = new Set(primary.map((d) => d.slug).filter(Boolean));
  const seenRepoPaths = new Set(primary.map((d) => d.repoPath).filter(Boolean));
  for (const item of secondary) {
    if (seenIds.has(item.id)) continue;
    if (item.slug && seenSlugs.has(item.slug)) continue;
    if (item.repoPath && seenRepoPaths.has(item.repoPath)) continue;
    result.push(item);
    seenIds.add(item.id);
    if (item.slug) seenSlugs.add(item.slug);
    if (item.repoPath) seenRepoPaths.add(item.repoPath);
  }
  return result;
}

function pushBrowserPath(targetPath: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== targetPath) {
    window.history.pushState({}, '', targetPath);
  }
}

export default function App() {
  const bundledDiscourses = useMemo(() => loadBundledArticleDiscourses([]), []);
  const initialSayadaws = useMemo(
    () => buildIndexedSayadaws([], [], bundledDiscourses),
    [bundledDiscourses],
  );

  const initialRoute = useMemo(
    () =>
      parseAppRoute(
        typeof window !== 'undefined' ? window.location.pathname : '/',
        bundledDiscourses,
        initialSayadaws,
      ),
    [bundledDiscourses, initialSayadaws],
  );

  const [auth, setAuth] = useState<AuthSessionState>(() => loadSavedPatSession());
  const [manifestLoaded, setManifestLoaded] = useState(false);

  const [managedSayadaws, setManagedSayadaws] = useState<SayadawProfile[]>(initialSayadaws);
  const [discourses, setDiscourses] = useState<DhammaDiscourse[]>(bundledDiscourses);
  const [deletedPaths, setDeletedPaths] = useState<string[]>([]);
  const [tips, setTips] = useState<MeditationTip[]>(INITIAL_MEDITATION_TIPS);
  const [events, setEvents] = useState<GroupEvent[]>(INITIAL_GROUP_EVENTS);
  const [formTabs, setFormTabs] = useState<GoogleFormTab[]>(INITIAL_FORM_TABS);
  const [activeFormTabId, setActiveFormTabId] = useState<string>(INITIAL_FORM_TABS[0]?.id || '');

  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DRAFT_DIRTY_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [lastActionsUrl, setLastActionsUrl] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());
  const [prefs, setPrefs] = useState<ReaderPreferences>(() => loadReaderPrefs());

  const [viewMode, setViewMode] = useState<'home' | 'reader' | 'login' | 'not-found'>(() => {
    if (initialRoute.kind === 'login') return 'login';
    if (initialRoute.kind === 'discourse') return 'reader';
    if (initialRoute.kind === 'not-found') return 'not-found';
    return 'home';
  });
  const [activeNav, setActiveNav] = useState<NavSection>(() => {
    if (initialRoute.kind === 'login') return 'login';
    if (initialRoute.kind === 'discourse') return 'reader';
    return 'discourses';
  });
  const [activeDiscourseId, setActiveDiscourseId] = useState<string>(() =>
    initialRoute.kind === 'discourse' ? initialRoute.discourse.id : bundledDiscourses[0]?.id || '',
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<TraditionCollection | 'All'>('All');
  const [selectedSayadawId, setSelectedSayadawId] = useState<string>(() =>
    initialRoute.kind === 'sayadaw' ? initialRoute.sayadawId : 'All',
  );
  const [selectedLanguage, setSelectedLanguage] = useState<DiscourseLanguage | 'All'>('All');
  const [onlySaved, setOnlySaved] = useState(false);

  // Store / Edit Discourse Modal (Owner Only)
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingDiscourse, setEditingDiscourse] = useState<DhammaDiscourse | null>(null);
  const [presetSayadawId, setPresetSayadawId] = useState<string | undefined>(undefined);

  const indexedSayadaws = useMemo(
    () => buildIndexedSayadaws([], managedSayadaws, discourses),
    [managedSayadaws, discourses],
  );

  // Hydrate content/archive.json on startup and merge with bundled content/articles files
  useEffect(() => {
    let cancelled = false;

    async function hydrateStartup() {
      const ownerActive = loadSavedPatSession().isOwner;
      const manifest = await fetchPublishedManifest();
      if (cancelled) return;

      const hasDirtyDrafts = (() => {
        try {
          return localStorage.getItem(DRAFT_DIRTY_KEY) === '1';
        } catch {
          return false;
        }
      })();

      if (ownerActive && hasDirtyDrafts) {
        const storedDeleted = loadStoredDeletedPaths();
        const deletedSet = new Set(storedDeleted);
        const storedS = loadStoredCustomSayadaws();
        const storedD = loadStoredDiscourses(bundledDiscourses);
        const activeBundled = loadBundledArticleDiscourses(storedS).filter(
          (b) => !deletedSet.has(b.repoPath),
        );

        setDeletedPaths(storedDeleted);
        setManagedSayadaws(storedS);
        setDiscourses(mergeDiscourseSources(storedD, activeBundled));
        setTips(loadStoredTips(INITIAL_MEDITATION_TIPS));
        setEvents(loadStoredEvents(INITIAL_GROUP_EVENTS));
        const storedTabs = loadStoredFormTabs(INITIAL_FORM_TABS);
        setFormTabs(storedTabs);
        if (storedTabs[0]) setActiveFormTabId(storedTabs[0].id);
      } else if (manifest) {
        const manifestDeleted = Array.isArray(manifest.deletedPaths) ? manifest.deletedPaths : [];
        const deletedSet = new Set(manifestDeleted);
        const manifestSayadaws = Array.isArray(manifest.sayadaws)
          ? manifest.sayadaws
          : Array.isArray(manifest.customSayadaws)
            ? manifest.customSayadaws
            : [];
        const activeBundled = loadBundledArticleDiscourses(manifestSayadaws).filter(
          (b) => !deletedSet.has(b.repoPath),
        );
        const mergedManifestDiscourses = mergeDiscourseSources(manifest.discourses, activeBundled);

        setDeletedPaths(manifestDeleted);
        setDiscourses(mergedManifestDiscourses);
        setManagedSayadaws(manifestSayadaws);
        if (Array.isArray(manifest.tips)) setTips(manifest.tips);
        if (Array.isArray(manifest.events)) setEvents(manifest.events);
        if (Array.isArray(manifest.formTabs)) {
          setFormTabs(manifest.formTabs);
          setActiveFormTabId(manifest.formTabs[0]?.id || '');
        }
      }

      setManifestLoaded(true);
    }

    hydrateStartup();
    return () => {
      cancelled = true;
    };
  }, [bundledDiscourses]);

  // Re-apply URL route once manifest discourses load
  const initialRouteSyncedRef = useRef(false);
  useEffect(() => {
    if (!manifestLoaded || initialRouteSyncedRef.current) return;
    initialRouteSyncedRef.current = true;

    const route = parseAppRoute(window.location.pathname, discourses, indexedSayadaws);
    if (route.kind === 'discourse') {
      setActiveDiscourseId(route.discourse.id);
      setViewMode('reader');
      setActiveNav('reader');
    } else if (route.kind === 'sayadaw') {
      setSelectedSayadawId(route.sayadawId);
      setViewMode('home');
      setActiveNav('discourses');
      setTimeout(() => {
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else if (route.kind === 'login') {
      setViewMode('login');
      setActiveNav('login');
    } else if (route.kind === 'not-found') {
      setViewMode('not-found');
    }
  }, [manifestLoaded, discourses, indexedSayadaws]);

  // Listen to browser Back / Forward navigation
  useEffect(() => {
    const onPopState = () => {
      const route = parseAppRoute(window.location.pathname, discourses, indexedSayadaws);
      if (route.kind === 'home') {
        setViewMode('home');
        setActiveNav('discourses');
        setSelectedSayadawId('All');
      } else if (route.kind === 'login') {
        setViewMode('login');
        setActiveNav('login');
      } else if (route.kind === 'discourse') {
        setActiveDiscourseId(route.discourse.id);
        setViewMode('reader');
        setActiveNav('reader');
      } else if (route.kind === 'sayadaw') {
        setSelectedSayadawId(route.sayadawId);
        setViewMode('home');
        setActiveNav('discourses');
        setTimeout(() => {
          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 40);
      } else if (route.kind === 'github') {
        if (auth.isOwner) {
          setViewMode('home');
          setActiveNav('github');
          setTimeout(() => {
            document.getElementById('github-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 40);
        } else {
          setViewMode('login');
          setActiveNav('login');
        }
      } else {
        setViewMode('not-found');
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [discourses, indexedSayadaws, auth.isOwner]);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveReaderPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const markOwnerDraftDirty = useCallback(
    (next: {
      discourses?: DhammaDiscourse[];
      sayadaws?: SayadawProfile[];
      deletedPaths?: string[];
      tips?: MeditationTip[];
      events?: GroupEvent[];
      formTabs?: GoogleFormTab[];
    }) => {
      if (next.discourses) saveStoredDiscourses(next.discourses);
      if (next.sayadaws) saveStoredCustomSayadaws(next.sayadaws);
      if (next.deletedPaths) saveStoredDeletedPaths(next.deletedPaths);
      if (next.tips) saveStoredTips(next.tips);
      if (next.events) saveStoredEvents(next.events);
      if (next.formTabs) saveStoredFormTabs(next.formTabs);
      try {
        localStorage.setItem(DRAFT_DIRTY_KEY, '1');
      } catch {
        // Ignore
      }
      setHasUnpublishedChanges(true);
      setPublishStatus(null);
      setPublishError(null);
    },
    [],
  );

  const activeDiscourse = useMemo(
    () => discourses.find((d) => d.id === activeDiscourseId) || discourses[0],
    [discourses, activeDiscourseId],
  );

  const handleNavigate = (target: NavSection) => {
    if (target === 'login') {
      setActiveNav('login');
      setViewMode('login');
      pushBrowserPath(buildLoginPath());
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'github' && !auth.isOwner) {
      setActiveNav('login');
      setViewMode('login');
      pushBrowserPath(buildLoginPath());
      return;
    }

    setActiveNav(target);
    if (target === 'reader') {
      if (activeDiscourse) {
        setViewMode('reader');
        pushBrowserPath(buildDiscoursePath(activeDiscourse, indexedSayadaws));
        return;
      }
      target = 'discourses';
      setActiveNav('discourses');
    }

    setViewMode('home');
    pushBrowserPath(buildHomePath());

    const sectionMap: Record<Exclude<NavSection, 'reader' | 'login'>, string> = {
      discourses: 'catalog-section',
      sayadaws: 'sayadaws-section',
      tips: 'tips-section',
      events: 'events-section',
      forms: 'forms-section',
      github: 'github-section',
    };

    setTimeout(() => {
      const el = document.getElementById(sectionMap[target as Exclude<NavSection, 'reader' | 'login'>]);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
  };

  const handleSelectDiscourse = (id: string) => {
    const found = discourses.find((d) => d.id === id) || discourses[0];
    if (!found) {
      handleNavigate('discourses');
      return;
    }
    setActiveDiscourseId(found.id);
    setViewMode('reader');
    setActiveNav('reader');
    pushBrowserPath(buildDiscoursePath(found, indexedSayadaws));
  };

  const handleSayadawFilterChange = (sayadawId: string) => {
    setSelectedSayadawId(sayadawId);
    if (sayadawId === 'All') {
      pushBrowserPath(buildHomePath());
    } else {
      pushBrowserPath(buildSayadawPath(getSayadawSlug(sayadawId, indexedSayadaws)));
    }
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleExportMarkdown = (discourse: DhammaDiscourse) => {
    const md = discourseToMarkdown(discourse);
    const filename = `${discourse.slug || discourse.id}.md`;
    triggerFileDownload(filename, md, 'text/markdown;charset=utf-8');
  };

  const handleFilterBySayadaw = (sayadawId: string) => {
    setSelectedSayadawId(sayadawId);
    setSelectedCollection('All');
    setOnlySaved(false);
    setViewMode('home');
    setActiveNav('discourses');
    pushBrowserPath(
      sayadawId === 'All'
        ? buildHomePath()
        : buildSayadawPath(getSayadawSlug(sayadawId, indexedSayadaws)),
    );
    setTimeout(() => {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 30);
  };

  // Owner-gated Sayadaw CRUD
  const handleSaveSayadaw = (sayadaw: SayadawProfile, isEdit: boolean) => {
    if (!auth.isOwner) return;
    const prevSayadaw = isEdit ? indexedSayadaws.find((s) => s.id === sayadaw.id) : undefined;
    const nextSayadaws = isEdit
      ? indexedSayadaws.map((s) => (s.id === sayadaw.id ? sayadaw : s))
      : [...indexedSayadaws, sayadaw];

    // Sync sayadawName across existing discourses under this Sayadaw
    const nextDiscourses = discourses.map((d) =>
      d.sayadawId === sayadaw.id ? { ...d, sayadawName: sayadaw.name } : d,
    );

    let nextDeleted = deletedPaths;
    if (
      prevSayadaw?.imageUrl?.startsWith('content/media/') &&
      prevSayadaw.imageUrl !== sayadaw.imageUrl
    ) {
      nextDeleted = Array.from(new Set([...deletedPaths, prevSayadaw.imageUrl]));
      setDeletedPaths(nextDeleted);
    }

    setManagedSayadaws(nextSayadaws);
    setDiscourses(nextDiscourses);
    markOwnerDraftDirty({
      sayadaws: nextSayadaws,
      discourses: nextDiscourses,
      deletedPaths: nextDeleted,
    });
  };

  const handleDeleteSayadaw = (sayadawId: string) => {
    if (!auth.isOwner) return;
    const targetSayadaw = indexedSayadaws.find((s) => s.id === sayadawId);
    const removedDiscourses = discourses.filter((d) => d.sayadawId === sayadawId);
    const remainingDiscourses = discourses.filter((d) => d.sayadawId !== sayadawId);
    const remainingSayadaws = indexedSayadaws.filter((s) => s.id !== sayadawId);

    const pathsToQueue: string[] = [];
    if (targetSayadaw?.imageUrl?.startsWith('content/media/')) {
      pathsToQueue.push(targetSayadaw.imageUrl);
    }
    for (const d of removedDiscourses) {
      if (d.repoPath?.startsWith('content/')) pathsToQueue.push(d.repoPath);
      pathsToQueue.push(...collectDiscourseMediaPaths(d));
    }

    const nextDeleted = Array.from(new Set([...deletedPaths, ...pathsToQueue]));
    setDeletedPaths(nextDeleted);
    setManagedSayadaws(remainingSayadaws);
    setDiscourses(remainingDiscourses);
    if (selectedSayadawId === sayadawId) {
      setSelectedSayadawId('All');
      pushBrowserPath(buildHomePath());
    }
    if (removedDiscourses.some((d) => d.id === activeDiscourseId)) {
      setActiveDiscourseId(remainingDiscourses[0]?.id || '');
      if (viewMode === 'reader') {
        setViewMode('home');
        setActiveNav('discourses');
      }
    }

    markOwnerDraftDirty({
      sayadaws: remainingSayadaws,
      discourses: remainingDiscourses,
      deletedPaths: nextDeleted,
    });
  };

  // Owner-gated Discourse CRUD
  const handleSaveTeaching = (
    discourse: DhammaDiscourse,
    isEdit: boolean,
    newSayadaw?: SayadawProfile,
  ) => {
    if (!auth.isOwner) return;
    let nextSayadaws = indexedSayadaws;
    if (newSayadaw) {
      nextSayadaws = indexedSayadaws.some((s) => s.id === newSayadaw.id)
        ? indexedSayadaws
        : [...indexedSayadaws, newSayadaw];
    }

    const prevDiscourse = isEdit ? discourses.find((d) => d.id === discourse.id) : undefined;
    const nextDiscourses = isEdit
      ? discourses.map((d) => (d.id === discourse.id ? discourse : d))
      : [discourse, ...discourses];

    const queuedRemovals: string[] = [];
    if (
      prevDiscourse?.repoPath?.startsWith('content/') &&
      prevDiscourse.repoPath !== discourse.repoPath
    ) {
      queuedRemovals.push(prevDiscourse.repoPath);
    }
    if (prevDiscourse) {
      const nextMedia = new Set(collectDiscourseMediaPaths(discourse));
      for (const oldMedia of collectDiscourseMediaPaths(prevDiscourse)) {
        if (!nextMedia.has(oldMedia)) queuedRemovals.push(oldMedia);
      }
    }

    const nextDeleted = Array.from(
      new Set([...deletedPaths, ...queuedRemovals].filter((p) => p !== discourse.repoPath)),
    );

    setDeletedPaths(nextDeleted);
    setManagedSayadaws(nextSayadaws);
    setDiscourses(nextDiscourses);

    const updatedSayadawIndex = buildIndexedSayadaws([], nextSayadaws, nextDiscourses);

    markOwnerDraftDirty({
      discourses: nextDiscourses,
      sayadaws: updatedSayadawIndex,
      deletedPaths: nextDeleted,
    });
    setIsStoreModalOpen(false);
    setEditingDiscourse(null);
    setPresetSayadawId(undefined);
    setActiveDiscourseId(discourse.id);
    setViewMode('reader');
    setActiveNav('reader');
    pushBrowserPath(buildDiscoursePath(discourse, updatedSayadawIndex));
  };

  const handleDeleteDiscourse = (id: string) => {
    if (!auth.isOwner) return;
    const target = discourses.find((d) => d.id === id);
    const remaining = discourses.filter((d) => d.id !== id);

    const queued: string[] = [];
    if (target?.repoPath?.startsWith('content/')) queued.push(target.repoPath);
    if (target) queued.push(...collectDiscourseMediaPaths(target));

    const nextDeleted = Array.from(new Set([...deletedPaths, ...queued]));
    setDeletedPaths(nextDeleted);
    setDiscourses(remaining);
    setBookmarks((prev) => prev.filter((b) => b !== id));
    setActiveDiscourseId(remaining[0]?.id || '');

    if (viewMode === 'reader') {
      setViewMode('home');
      setActiveNav('discourses');
      pushBrowserPath(buildHomePath());
    }

    markOwnerDraftDirty({
      discourses: remaining,
      deletedPaths: nextDeleted,
    });
  };

  const handleSaveTip = (tip: MeditationTip, isEdit: boolean) => {
    if (!auth.isOwner) return;
    const next = isEdit ? tips.map((t) => (t.id === tip.id ? tip : t)) : [tip, ...tips];
    setTips(next);
    markOwnerDraftDirty({ tips: next });
  };

  const handleDeleteTip = (id: string) => {
    if (!auth.isOwner) return;
    const next = tips.filter((t) => t.id !== id);
    setTips(next);
    markOwnerDraftDirty({ tips: next });
  };

  const handleSaveEvent = (evt: GroupEvent, isEdit: boolean) => {
    if (!auth.isOwner) return;
    const next = isEdit ? events.map((e) => (e.id === evt.id ? evt : e)) : [evt, ...events];
    setEvents(next);
    markOwnerDraftDirty({ events: next });
  };

  const handleDeleteEvent = (id: string) => {
    if (!auth.isOwner) return;
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    markOwnerDraftDirty({ events: next });
  };

  const handleRegisterWithForm = (formTabId: string) => {
    if (formTabs.some((t) => t.id === formTabId)) {
      setActiveFormTabId(formTabId);
    }
    handleNavigate('forms');
  };

  const handleSaveFormTab = (tab: GoogleFormTab, isNew: boolean) => {
    if (!auth.isOwner) return;
    const next = isNew
      ? [...formTabs, tab]
      : formTabs.map((t) => (t.id === tab.id ? tab : t));
    setFormTabs(next);
    markOwnerDraftDirty({ formTabs: next });
  };

  const handleDeleteFormTab = (id: string) => {
    if (!auth.isOwner) return;
    const remaining = formTabs.filter((t) => t.id !== id);
    setFormTabs(remaining);
    if (activeFormTabId === id) {
      setActiveFormTabId(remaining[0]?.id || '');
    }
    markOwnerDraftDirty({ formTabs: remaining });
  };

  const handleResetArchive = async () => {
    if (!auth.isOwner) return;
    clearAllStoredArchive();
    try {
      localStorage.removeItem(DRAFT_DIRTY_KEY);
    } catch {
      // Ignore
    }
    const manifest = await fetchPublishedManifest();
    if (manifest) {
      const mDeleted = Array.isArray(manifest.deletedPaths) ? manifest.deletedPaths : [];
      const deletedSet = new Set(mDeleted);
      const mSayadaws = Array.isArray(manifest.sayadaws)
        ? manifest.sayadaws
        : manifest.customSayadaws || [];
      const activeBundled = loadBundledArticleDiscourses(mSayadaws).filter(
        (b) => !deletedSet.has(b.repoPath),
      );
      const merged = mergeDiscourseSources(manifest.discourses, activeBundled);
      setDeletedPaths(mDeleted);
      setManagedSayadaws(mSayadaws);
      setDiscourses(merged);
      setTips(manifest.tips || INITIAL_MEDITATION_TIPS);
      setEvents(manifest.events || INITIAL_GROUP_EVENTS);
      setFormTabs(manifest.formTabs || INITIAL_FORM_TABS);
      setActiveFormTabId(manifest.formTabs?.[0]?.id || '');
      setActiveDiscourseId(merged[0]?.id || '');
    } else {
      setDeletedPaths([]);
      setManagedSayadaws(initialSayadaws);
      setDiscourses(bundledDiscourses);
      setTips(INITIAL_MEDITATION_TIPS);
      setEvents(INITIAL_GROUP_EVENTS);
      setFormTabs(INITIAL_FORM_TABS);
      setActiveFormTabId(INITIAL_FORM_TABS[0]?.id || '');
      setActiveDiscourseId(bundledDiscourses[0]?.id || '');
    }
    setSelectedSayadawId('All');
    setSelectedCollection('All');
    setSelectedLanguage('All');
    setSearchQuery('');
    setOnlySaved(false);
    setHasUnpublishedChanges(false);
    setPublishStatus(null);
    setPublishError(null);
    pushBrowserPath(buildHomePath());
  };

  const handlePatSuccess = (token: string, user: GitHubAuthUser) => {
    savePatSession(token, user);
    setAuth({ isOwner: true, mode: 'pat', user, patToken: token });
    setViewMode('home');
    setActiveNav('discourses');
    pushBrowserPath(buildHomePath());
  };

  const handleLogout = () => {
    clearPatSession();
    setAuth({ isOwner: false, mode: 'none', user: null });
    setIsStoreModalOpen(false);
    if (activeNav === 'github') {
      setActiveNav('discourses');
      setViewMode('home');
      pushBrowserPath(buildHomePath());
    }
  };

  const handlePublishToGitHub = async () => {
    if (!auth.isOwner) return;
    setIsPublishing(true);
    setPublishError(null);
    setLastActionsUrl(null);
    setPublishStatus('Preparing archive files...');

    try {
      const result = await publishArchiveToGitHub({
        auth,
        discourses,
        sayadaws: indexedSayadaws,
        deletedPaths,
        tips,
        events,
        formTabs,
        onProgress: (step) => setPublishStatus(step),
      });

      setDiscourses(result.updatedDiscourses);
      setManagedSayadaws(result.updatedSayadaws);
      setDeletedPaths([]);
      saveStoredDiscourses(result.updatedDiscourses);
      saveStoredCustomSayadaws(result.updatedSayadaws);
      saveStoredDeletedPaths([]);
      saveStoredTips(tips);
      saveStoredEvents(events);
      saveStoredFormTabs(formTabs);
      try {
        localStorage.removeItem(DRAFT_DIRTY_KEY);
      } catch {
        // Ignore
      }
      setHasUnpublishedChanges(false);
      setLastActionsUrl(result.repoActionsUrl);
      const delMsg =
        result.deletedFiles.length > 0 ? ` and removed ${result.deletedFiles.length} file(s)` : '';
      setPublishStatus(
        `Committed ${result.committedFiles.length} file(s)${delMsg} to theartofnoting/dhamma_content.`,
      );
    } catch (err) {
      setPublishStatus(null);
      setPublishError(
        err instanceof Error ? err.message : 'Unable to commit changes to GitHub.',
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#181512] text-[#1C1917] dark:text-[#F5F5F4] transition-colors duration-200">
      <Header
        activeSection={viewMode === 'reader' ? 'reader' : activeNav}
        isOwner={auth.isOwner}
        onNavigate={handleNavigate}
        onOpenStoreModal={() => {
          if (!auth.isOwner) return;
          setEditingDiscourse(null);
          setPresetSayadawId(selectedSayadawId !== 'All' ? selectedSayadawId : undefined);
          setIsStoreModalOpen(true);
        }}
      />

      {auth.isOwner && (
        <OwnerSessionBar
          auth={auth}
          hasUnpublishedChanges={hasUnpublishedChanges}
          pendingDeletionCount={deletedPaths.length}
          isPublishing={isPublishing}
          publishStatus={publishStatus}
          publishError={publishError}
          lastActionsUrl={lastActionsUrl}
          onPublishToGitHub={handlePublishToGitHub}
          onOpenGitHubStudio={() => handleNavigate('github')}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1">
        {viewMode === 'login' ? (
          <LoginPage
            auth={auth}
            onPatSuccess={handlePatSuccess}
            onLogout={handleLogout}
            onBackToArchive={() => handleNavigate('discourses')}
          />
        ) : viewMode === 'not-found' ? (
          <section className="mx-auto max-w-[780px] px-4 py-20 sm:px-8 text-center space-y-5">
            <p className="font-mono-code text-xs uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
              Archive Entry Not Found
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
              The requested discourse or Sayadaw path could not be located.
            </h1>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('discourses')}
                className="min-h-[42px] px-5 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] cursor-pointer"
              >
                Return to Discourse Index
              </button>
            </div>
          </section>
        ) : viewMode === 'reader' && activeDiscourse ? (
          <ReadingRoom
            discourse={activeDiscourse}
            allDiscourses={discourses}
            sayadaws={indexedSayadaws}
            isBookmarked={bookmarks.includes(activeDiscourse.id)}
            isOwner={auth.isOwner}
            prefs={prefs}
            onUpdatePrefs={setPrefs}
            onBackToCatalog={() => handleNavigate('discourses')}
            onSelectDiscourse={handleSelectDiscourse}
            onFilterBySayadaw={handleFilterBySayadaw}
            onToggleBookmark={handleToggleBookmark}
            onExportMarkdown={handleExportMarkdown}
            onEditDiscourse={(d) => {
              if (!auth.isOwner) return;
              setEditingDiscourse(d);
              setPresetSayadawId(undefined);
              setIsStoreModalOpen(true);
            }}
            onDeleteDiscourse={handleDeleteDiscourse}
          />
        ) : (
          <>
            <HeroSection
              totalDiscourses={discourses.length}
              totalTips={tips.length}
              totalEvents={events.length}
              isOwner={auth.isOwner}
              onEnterReadingRoom={() =>
                activeDiscourse
                  ? handleSelectDiscourse(activeDiscourse.id)
                  : handleNavigate('discourses')
              }
              onExploreEvents={() => handleNavigate('events')}
              onOpenGitHubStudio={() => handleNavigate('github')}
            />

            <DiscourseCatalog
              discourses={discourses}
              sayadaws={indexedSayadaws}
              bookmarks={bookmarks}
              isOwner={auth.isOwner}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCollection={selectedCollection}
              onCollectionChange={setSelectedCollection}
              selectedSayadawId={selectedSayadawId}
              onSayadawChange={handleSayadawFilterChange}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              onlySaved={onlySaved}
              onToggleOnlySaved={() => setOnlySaved((prev) => !prev)}
              darkMode={prefs.darkMode}
              onToggleDarkMode={() => setPrefs((p) => ({ ...p, darkMode: !p.darkMode }))}
              onSelectDiscourse={handleSelectDiscourse}
              onToggleBookmark={handleToggleBookmark}
              onExportMarkdown={handleExportMarkdown}
              onEditDiscourse={(d) => {
                if (!auth.isOwner) return;
                setEditingDiscourse(d);
                setPresetSayadawId(undefined);
                setIsStoreModalOpen(true);
              }}
              onDeleteDiscourse={handleDeleteDiscourse}
              onOpenStoreModal={(presetId) => {
                if (!auth.isOwner) return;
                setEditingDiscourse(null);
                setPresetSayadawId(presetId);
                setIsStoreModalOpen(true);
              }}
            />

            <SayadawDirectory
              sayadaws={indexedSayadaws}
              discourses={discourses}
              isOwner={auth.isOwner}
              onFilterBySayadaw={handleFilterBySayadaw}
              onSaveSayadaw={handleSaveSayadaw}
              onDeleteSayadaw={handleDeleteSayadaw}
            />

            <MeditationTipsSection
              tips={tips}
              isOwner={auth.isOwner}
              onSaveTip={handleSaveTip}
              onDeleteTip={handleDeleteTip}
            />

            <EventsCalendarSection
              events={events}
              formTabs={formTabs}
              isOwner={auth.isOwner}
              onSaveEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
              onRegisterWithForm={handleRegisterWithForm}
            />

            <FormsEmbedSection
              formTabs={formTabs}
              activeTabId={activeFormTabId}
              isOwner={auth.isOwner}
              onSelectTab={setActiveFormTabId}
              onSaveFormTab={handleSaveFormTab}
              onDeleteFormTab={handleDeleteFormTab}
            />

            {auth.isOwner && (
              <GitHubPagesStudio
                sayadaws={indexedSayadaws}
                discourses={discourses}
                tips={tips}
                events={events}
                pendingDeletionCount={deletedPaths.length}
                hasUnpublishedChanges={hasUnpublishedChanges}
                isPublishing={isPublishing}
                publishStatus={publishStatus}
                publishError={publishError}
                lastActionsUrl={lastActionsUrl}
                onPublishToGitHub={handlePublishToGitHub}
                onExportMarkdown={handleExportMarkdown}
              />
            )}
          </>
        )}
      </main>

      <Footer
        isOwner={auth.isOwner}
        ownerLogin={auth.user?.login}
        onNavigate={handleNavigate}
        onResetArchive={handleResetArchive}
      />

      {auth.isOwner && (
        <StoreTeachingModal
          isOpen={isStoreModalOpen}
          editingDiscourse={editingDiscourse}
          presetSayadawId={presetSayadawId}
          sayadaws={indexedSayadaws}
          existingCount={discourses.length}
          onClose={() => {
            setIsStoreModalOpen(false);
            setEditingDiscourse(null);
            setPresetSayadawId(undefined);
          }}
          onSave={handleSaveTeaching}
        />
      )}
    </div>
  );
}
