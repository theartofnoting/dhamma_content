import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GITHUB_CONFIG, SECTION_IDS } from '../config/siteConfig';
import {
  buildIndexedSayadaws,
  clearAllStoredArchive,
  fetchPublishedManifest,
  hasDirtyDraftFlag,
  loadBookmarks,
  loadReaderPrefs,
  loadStoredCustomSayadaws,
  loadStoredDeletedPaths,
  loadStoredDiscourses,
  loadStoredEvents,
  loadStoredFormTabs,
  loadStoredTips,
  mergeDiscourseSources,
  saveBookmarks,
  saveReaderPrefs,
  saveStoredCustomSayadaws,
  saveStoredDeletedPaths,
  saveStoredDiscourses,
  saveStoredEvents,
  saveStoredFormTabs,
  saveStoredTips,
  setDirtyDraftFlag,
} from '../content/archiveStore';
import { loadBundledArticleDiscourses } from '../content/articleLoader';
import { discourseToMarkdown } from '../content/exporters';
import { getLocaleDictionary } from '../i18n';
import {
  AuthSessionState,
  clearPatSession,
  collectDiscourseMediaPaths,
  loadSavedPatSession,
  publishArchiveToGitHub,
  savePatSession,
} from '../plugins/githubPublisher';
import {
  buildDiscoursePath,
  buildHomePath,
  buildLoginPath,
  buildSayadawPath,
  buildSwitchedLocalePath,
  parseAppRoute,
  pushBrowserPath,
} from '../plugins/urlRouter';
import { triggerFileDownload } from '../tools/fileTools';
import { getSayadawSlug } from '../tools/slugify';
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
  SiteLocale,
  TraditionCollection,
} from '../types/dhamma';

export function useArchiveState() {
  const bundledDiscourses = useMemo(() => loadBundledArticleDiscourses([]), []);
  const initialSayadaws = useMemo(
    () => buildIndexedSayadaws([], bundledDiscourses),
    [bundledDiscourses],
  );
  const initialParsed = useMemo(
    () =>
      parseAppRoute(
        typeof window !== 'undefined' ? window.location.pathname : '/',
        bundledDiscourses,
        initialSayadaws,
      ),
    [bundledDiscourses, initialSayadaws],
  );

  const [locale, setLocale] = useState<SiteLocale>(initialParsed.locale);
  const [auth, setAuth] = useState<AuthSessionState>(() => loadSavedPatSession());
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [managedSayadaws, setManagedSayadaws] = useState<SayadawProfile[]>(initialSayadaws);
  const [discourses, setDiscourses] = useState<DhammaDiscourse[]>(bundledDiscourses);
  const [deletedPaths, setDeletedPaths] = useState<string[]>([]);
  const [tips, setTips] = useState<MeditationTip[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [formTabs, setFormTabs] = useState<GoogleFormTab[]>([]);
  const [activeFormTabId, setActiveFormTabId] = useState<string>('');

  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(() =>
    hasDirtyDraftFlag(),
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [lastActionsUrl, setLastActionsUrl] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());
  const [prefs, setPrefs] = useState<ReaderPreferences>(() => loadReaderPrefs());

  const [viewMode, setViewMode] = useState<'home' | 'reader' | 'login' | 'not-found'>(() => {
    if (initialParsed.route.kind === 'login') return 'login';
    if (initialParsed.route.kind === 'discourse') return 'reader';
    if (initialParsed.route.kind === 'not-found') return 'not-found';
    return 'home';
  });
  const [activeNav, setActiveNav] = useState<NavSection>(() => {
    if (initialParsed.route.kind === 'login') return 'login';
    if (initialParsed.route.kind === 'discourse') return 'reader';
    return 'discourses';
  });
  const [activeDiscourseId, setActiveDiscourseId] = useState<string>(() =>
    initialParsed.route.kind === 'discourse'
      ? initialParsed.route.discourse.id
      : bundledDiscourses[0]?.id || '',
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<TraditionCollection | 'All'>('All');
  const [selectedSayadawId, setSelectedSayadawId] = useState<string>(() =>
    initialParsed.route.kind === 'sayadaw' ? initialParsed.route.sayadawId : 'All',
  );
  const [selectedLanguage, setSelectedLanguage] = useState<DiscourseLanguage | 'All'>('All');
  const [onlySaved, setOnlySaved] = useState(false);

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingDiscourse, setEditingDiscourse] = useState<DhammaDiscourse | null>(null);
  const [presetSayadawId, setPresetSayadawId] = useState<string | undefined>(undefined);

  const indexedSayadaws = useMemo(
    () => buildIndexedSayadaws(managedSayadaws, discourses),
    [managedSayadaws, discourses],
  );

  const activeDiscourse = useMemo(
    () => discourses.find((d) => d.id === activeDiscourseId) || discourses[0],
    [discourses, activeDiscourseId],
  );

  useEffect(() => {
    let cancelled = false;

    async function hydrateStartup() {
      const ownerActive = loadSavedPatSession().isOwner;
      const manifest = await fetchPublishedManifest();
      if (cancelled) return;

      if (ownerActive && hasDirtyDraftFlag()) {
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
        setTips(loadStoredTips(manifest?.tips || []));
        setEvents(loadStoredEvents(manifest?.events || []));
        const storedTabs = loadStoredFormTabs(manifest?.formTabs || []);
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
        setTips(Array.isArray(manifest.tips) ? manifest.tips : []);
        setEvents(Array.isArray(manifest.events) ? manifest.events : []);
        const nextTabs = Array.isArray(manifest.formTabs) ? manifest.formTabs : [];
        setFormTabs(nextTabs);
        setActiveFormTabId(nextTabs[0]?.id || '');
      }
      setManifestLoaded(true);
    }

    hydrateStartup();
    return () => {
      cancelled = true;
    };
  }, [bundledDiscourses]);

  const initialRouteSyncedRef = useRef(false);
  useEffect(() => {
    if (!manifestLoaded || initialRouteSyncedRef.current) return;
    initialRouteSyncedRef.current = true;
    const parsed = parseAppRoute(window.location.pathname, discourses, indexedSayadaws);
    setLocale(parsed.locale);

    if (parsed.route.kind === 'discourse') {
      setActiveDiscourseId(parsed.route.discourse.id);
      setViewMode('reader');
      setActiveNav('reader');
    } else if (parsed.route.kind === 'sayadaw') {
      setSelectedSayadawId(parsed.route.sayadawId);
      setViewMode('home');
      setActiveNav('discourses');
      setTimeout(() => {
        document.getElementById(SECTION_IDS.discourses)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else if (parsed.route.kind === 'login') {
      setViewMode('login');
      setActiveNav('login');
    } else if (parsed.route.kind === 'not-found') {
      setViewMode('not-found');
    }
  }, [manifestLoaded, discourses, indexedSayadaws]);

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseAppRoute(window.location.pathname, discourses, indexedSayadaws);
      setLocale(parsed.locale);

      if (parsed.route.kind === 'home') {
        setViewMode('home');
        setActiveNav('discourses');
        setSelectedSayadawId('All');
      } else if (parsed.route.kind === 'login') {
        setViewMode('login');
        setActiveNav('login');
      } else if (parsed.route.kind === 'discourse') {
        setActiveDiscourseId(parsed.route.discourse.id);
        setViewMode('reader');
        setActiveNav('reader');
      } else if (parsed.route.kind === 'sayadaw') {
        setSelectedSayadawId(parsed.route.sayadawId);
        setViewMode('home');
        setActiveNav('discourses');
        setTimeout(() => {
          document.getElementById(SECTION_IDS.discourses)?.scrollIntoView({ behavior: 'smooth' });
        }, 40);
      } else if (parsed.route.kind === 'github') {
        if (auth.isOwner) {
          setViewMode('home');
          setActiveNav('github');
          setTimeout(() => {
            document.getElementById(SECTION_IDS.github)?.scrollIntoView({ behavior: 'smooth' });
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
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveReaderPrefs(prefs);
    document.documentElement.classList.toggle('dark', prefs.darkMode);
  }, [prefs]);

  useEffect(() => {
    const dict = getLocaleDictionary(locale);
    document.documentElement.lang = locale;

    if (viewMode === 'reader' && activeDiscourse) {
      document.title = `${activeDiscourse.title} — ${activeDiscourse.sayadawName} | Vipassana Bhavana`;
    } else {
      document.title = dict.meta.pageTitle;
    }
  }, [locale, viewMode, activeDiscourse]);

  const markOwnerDraftDirty = useCallback(
    (overrides: {
      discourses?: DhammaDiscourse[];
      sayadaws?: SayadawProfile[];
      deletedPaths?: string[];
      tips?: MeditationTip[];
      events?: GroupEvent[];
      formTabs?: GoogleFormTab[];
    }) => {
      saveStoredDiscourses(overrides.discourses ?? discourses);
      saveStoredCustomSayadaws(overrides.sayadaws ?? indexedSayadaws);
      saveStoredDeletedPaths(overrides.deletedPaths ?? deletedPaths);
      saveStoredTips(overrides.tips ?? tips);
      saveStoredEvents(overrides.events ?? events);
      saveStoredFormTabs(overrides.formTabs ?? formTabs);
      setDirtyDraftFlag(true);
      setHasUnpublishedChanges(true);
      setPublishStatus(null);
      setPublishError(null);
    },
    [discourses, indexedSayadaws, deletedPaths, tips, events, formTabs],
  );

  const switchLocale = useCallback(
    (targetLocale: SiteLocale) => {
      setLocale(targetLocale);
      if (typeof window !== 'undefined') {
        const nextPath = buildSwitchedLocalePath(window.location.pathname, targetLocale);
        pushBrowserPath(nextPath);
      }
    },
    [],
  );

  const navigate = useCallback(
    (target: NavSection) => {
      if (target === 'login') {
        setViewMode('login');
        setActiveNav('login');
        pushBrowserPath(buildLoginPath(locale));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (target === 'reader') {
        const targetDiscourse = activeDiscourse || discourses[0];
        if (targetDiscourse) {
          setActiveDiscourseId(targetDiscourse.id);
          setViewMode('reader');
          setActiveNav('reader');
          pushBrowserPath(buildDiscoursePath(targetDiscourse, indexedSayadaws, locale));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setViewMode('home');
          setActiveNav('discourses');
          pushBrowserPath(buildHomePath(locale));
          setTimeout(() => {
            document.getElementById(SECTION_IDS.discourses)?.scrollIntoView({ behavior: 'smooth' });
          }, 40);
        }
        return;
      }

      if (target === 'github' && !auth.isOwner) {
        setViewMode('login');
        setActiveNav('login');
        pushBrowserPath(buildLoginPath(locale));
        return;
      }

      const wasNotHome = viewMode !== 'home';
      setViewMode('home');
      setActiveNav(target);
      if (selectedSayadawId === 'All') {
        pushBrowserPath(buildHomePath(locale));
      }

      const elementId = SECTION_IDS[target];
      setTimeout(
        () => {
          document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        wasNotHome ? 60 : 0,
      );
    },
    [activeDiscourse, discourses, indexedSayadaws, auth.isOwner, viewMode, selectedSayadawId, locale],
  );

  const selectDiscourse = useCallback(
    (id: string) => {
      const target = discourses.find((d) => d.id === id);
      setActiveDiscourseId(id);
      setViewMode('reader');
      setActiveNav('reader');
      if (target) {
        pushBrowserPath(buildDiscoursePath(target, indexedSayadaws, locale));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [discourses, indexedSayadaws, locale],
  );

  const changeSayadawFilter = useCallback(
    (sayadawId: string) => {
      setSelectedSayadawId(sayadawId);
      if (sayadawId === 'All') {
        pushBrowserPath(buildHomePath(locale));
      } else {
        const sSlug = getSayadawSlug(sayadawId, indexedSayadaws);
        pushBrowserPath(buildSayadawPath(sSlug, locale));
      }
    },
    [indexedSayadaws, locale],
  );

  const filterBySayadaw = useCallback(
    (sayadawId: string) => {
      changeSayadawFilter(sayadawId);
      setViewMode('home');
      setActiveNav('discourses');
      setTimeout(() => {
        document.getElementById(SECTION_IDS.discourses)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    },
    [changeSayadawFilter],
  );

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const exportMarkdown = useCallback((d: DhammaDiscourse) => {
    const md = discourseToMarkdown(d);
    const filename = `${d.accessionCode.toLowerCase()}-${d.slug || d.id}.md`;
    triggerFileDownload(filename, md, 'text/markdown;charset=utf-8');
  }, []);

  const openStoreModal = useCallback(
    (presetId?: string, discourseToEdit?: DhammaDiscourse) => {
      if (!auth.isOwner) return;
      setEditingDiscourse(discourseToEdit || null);
      setPresetSayadawId(presetId);
      setIsStoreModalOpen(true);
    },
    [auth.isOwner],
  );

  const closeStoreModal = useCallback(() => {
    setIsStoreModalOpen(false);
    setEditingDiscourse(null);
    setPresetSayadawId(undefined);
  }, []);

  const saveSayadaw = (sayadaw: SayadawProfile, isEdit: boolean) => {
    if (!auth.isOwner) return;
    const prevSayadaw = isEdit ? indexedSayadaws.find((s) => s.id === sayadaw.id) : undefined;
    const nextSayadaws = isEdit
      ? indexedSayadaws.map((s) => (s.id === sayadaw.id ? sayadaw : s))
      : [sayadaw, ...indexedSayadaws];

    const nextDiscourses = discourses.map((d) =>
      d.sayadawId === sayadaw.id ? { ...d, sayadawName: sayadaw.name } : d,
    );

    const nextDeleted =
      prevSayadaw?.imageUrl &&
      prevSayadaw.imageUrl.startsWith(`${GITHUB_CONFIG.mediaRoot}/`) &&
      prevSayadaw.imageUrl !== sayadaw.imageUrl
        ? Array.from(new Set([...deletedPaths, prevSayadaw.imageUrl]))
        : deletedPaths;

    setDeletedPaths(nextDeleted);
    setManagedSayadaws(nextSayadaws);
    setDiscourses(nextDiscourses);
    markOwnerDraftDirty({
      sayadaws: nextSayadaws,
      discourses: nextDiscourses,
      deletedPaths: nextDeleted,
    });
  };

  const deleteSayadaw = (sayadawId: string) => {
    if (!auth.isOwner) return;
    const targetSayadaw = indexedSayadaws.find((s) => s.id === sayadawId);
    const removedDiscourses = discourses.filter((d) => d.sayadawId === sayadawId);
    const remainingDiscourses = discourses.filter((d) => d.sayadawId !== sayadawId);
    const remainingSayadaws = indexedSayadaws.filter((s) => s.id !== sayadawId);

    const queuedRemovals: string[] = [];
    if (targetSayadaw?.imageUrl?.startsWith(`${GITHUB_CONFIG.mediaRoot}/`)) {
      queuedRemovals.push(targetSayadaw.imageUrl);
    }
    for (const d of removedDiscourses) {
      if (d.repoPath?.startsWith('content/')) queuedRemovals.push(d.repoPath);
      queuedRemovals.push(...collectDiscourseMediaPaths(d));
    }

    const nextDeleted = Array.from(new Set([...deletedPaths, ...queuedRemovals]));
    setDeletedPaths(nextDeleted);
    setManagedSayadaws(remainingSayadaws);
    setDiscourses(remainingDiscourses);
    setBookmarks((prev) => prev.filter((id) => !removedDiscourses.some((d) => d.id === id)));

    if (selectedSayadawId === sayadawId) {
      setSelectedSayadawId('All');
      pushBrowserPath(buildHomePath(locale));
    }
    if (removedDiscourses.some((d) => d.id === activeDiscourseId)) {
      setActiveDiscourseId(remainingDiscourses[0]?.id || '');
    }

    markOwnerDraftDirty({
      sayadaws: remainingSayadaws,
      discourses: remainingDiscourses,
      deletedPaths: nextDeleted,
    });
  };

  const saveTeaching = (discourse: DhammaDiscourse, isEdit: boolean, newSayadaw?: SayadawProfile) => {
    if (!auth.isOwner) return;
    const prevDiscourse = isEdit ? discourses.find((d) => d.id === discourse.id) : undefined;
    const nextSayadaws = newSayadaw ? [newSayadaw, ...indexedSayadaws] : indexedSayadaws;
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
    const updatedSayadawIndex = buildIndexedSayadaws(nextSayadaws, nextDiscourses);

    setDeletedPaths(nextDeleted);
    setManagedSayadaws(nextSayadaws);
    setDiscourses(nextDiscourses);
    markOwnerDraftDirty({
      discourses: nextDiscourses,
      sayadaws: updatedSayadawIndex,
      deletedPaths: nextDeleted,
    });

    closeStoreModal();
    setActiveDiscourseId(discourse.id);
    setViewMode('reader');
    setActiveNav('reader');
    pushBrowserPath(buildDiscoursePath(discourse, updatedSayadawIndex, locale));
  };

  const deleteDiscourse = (id: string) => {
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
      pushBrowserPath(buildHomePath(locale));
    }

    markOwnerDraftDirty({
      discourses: remaining,
      deletedPaths: nextDeleted,
    });
  };

  const saveTip = (tip: MeditationTip, isEdit: boolean) => {
    if (!auth.isOwner) return;
    const next = isEdit ? tips.map((t) => (t.id === tip.id ? tip : t)) : [tip, ...tips];
    setTips(next);
    markOwnerDraftDirty({ tips: next });
  };

  const deleteTip = (id: string) => {
    if (!auth.isOwner) return;
    const next = tips.filter((t) => t.id !== id);
    setTips(next);
    markOwnerDraftDirty({ tips: next });
  };

  const saveEvent = (evt: GroupEvent, isEdit: boolean) => {
    if (!auth.isOwner) return;
    const next = isEdit ? events.map((e) => (e.id === evt.id ? evt : e)) : [evt, ...events];
    setEvents(next);
    markOwnerDraftDirty({ events: next });
  };

  const deleteEvent = (id: string) => {
    if (!auth.isOwner) return;
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    markOwnerDraftDirty({ events: next });
  };

  const registerWithForm = (formTabId: string) => {
    if (formTabs.some((t) => t.id === formTabId)) {
      setActiveFormTabId(formTabId);
    }
    navigate('forms');
  };

  const saveFormTab = (tab: GoogleFormTab, isNew: boolean) => {
    if (!auth.isOwner) return;
    const next = isNew ? [...formTabs, tab] : formTabs.map((t) => (t.id === tab.id ? tab : t));
    setFormTabs(next);
    markOwnerDraftDirty({ formTabs: next });
  };

  const deleteFormTab = (id: string) => {
    if (!auth.isOwner) return;
    const remaining = formTabs.filter((t) => t.id !== id);
    setFormTabs(remaining);
    if (activeFormTabId === id) {
      setActiveFormTabId(remaining[0]?.id || '');
    }
    markOwnerDraftDirty({ formTabs: remaining });
  };

  const resetArchive = async () => {
    if (!auth.isOwner) return;
    clearAllStoredArchive();
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
      setTips(Array.isArray(manifest.tips) ? manifest.tips : []);
      setEvents(Array.isArray(manifest.events) ? manifest.events : []);
      const nextTabs = Array.isArray(manifest.formTabs) ? manifest.formTabs : [];
      setFormTabs(nextTabs);
      setActiveFormTabId(nextTabs[0]?.id || '');
      setActiveDiscourseId(merged[0]?.id || '');
    } else {
      setDeletedPaths([]);
      setManagedSayadaws(initialSayadaws);
      setDiscourses(bundledDiscourses);
      setTips([]);
      setEvents([]);
      setFormTabs([]);
      setActiveFormTabId('');
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
    pushBrowserPath(buildHomePath(locale));
  };

  const loginWithPat = (token: string, user: GitHubAuthUser) => {
    savePatSession(token, user);
    setAuth({ isOwner: true, mode: 'pat', user, patToken: token });
    setViewMode('home');
    setActiveNav('discourses');
    pushBrowserPath(buildHomePath(locale));
  };

  const logout = () => {
    clearPatSession();
    setAuth({ isOwner: false, mode: 'none', user: null });
    closeStoreModal();
    if (activeNav === 'github') {
      setActiveNav('discourses');
      setViewMode('home');
      pushBrowserPath(buildHomePath(locale));
    }
  };

  const publishToGitHub = async () => {
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
      setDirtyDraftFlag(false);
      setHasUnpublishedChanges(false);
      setLastActionsUrl(result.repoActionsUrl);
      const delMsg =
        result.deletedFiles.length > 0 ? ` and removed ${result.deletedFiles.length} file(s)` : '';
      setPublishStatus(
        `Committed ${result.committedFiles.length} file(s)${delMsg} to ${GITHUB_CONFIG.repoSlug}.`,
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

  return {
    locale,
    switchLocale,
    auth,
    viewMode,
    activeNav,
    indexedSayadaws,
    discourses,
    activeDiscourse,
    deletedPaths,
    tips,
    events,
    formTabs,
    activeFormTabId,
    setActiveFormTabId,
    bookmarks,
    prefs,
    setPrefs,
    hasUnpublishedChanges,
    isPublishing,
    publishStatus,
    publishError,
    lastActionsUrl,
    searchQuery,
    setSearchQuery,
    selectedCollection,
    setSelectedCollection,
    selectedSayadawId,
    selectedLanguage,
    setSelectedLanguage,
    onlySaved,
    toggleOnlySaved: () => setOnlySaved((prev) => !prev),
    isStoreModalOpen,
    editingDiscourse,
    presetSayadawId,
    navigate,
    selectDiscourse,
    changeSayadawFilter,
    filterBySayadaw,
    toggleBookmark,
    exportMarkdown,
    openStoreModal,
    closeStoreModal,
    saveSayadaw,
    deleteSayadaw,
    saveTeaching,
    deleteDiscourse,
    saveTip,
    deleteTip,
    saveEvent,
    deleteEvent,
    registerWithForm,
    saveFormTab,
    deleteFormTab,
    resetArchive,
    loginWithPat,
    logout,
    publishToGitHub,
  };
}
