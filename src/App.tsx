import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { INITIAL_DISCOURSES, SAYADAW_PROFILES } from './data/dhammaSeed';
import {
  INITIAL_FORM_TABS,
  INITIAL_GROUP_EVENTS,
  INITIAL_MEDITATION_TIPS,
} from './data/communitySeed';
import {
  DhammaDiscourse,
  DiscourseLanguage,
  GoogleFormTab,
  GroupEvent,
  MeditationTip,
  NavSection,
  ReaderPreferences,
  TraditionCollection,
} from './types/dhamma';
import {
  clearAllStoredArchive,
  discourseToMarkdown,
  loadBookmarks,
  loadReaderPrefs,
  loadStoredDiscourses,
  loadStoredEvents,
  loadStoredFormTabs,
  loadStoredTips,
  saveBookmarks,
  saveReaderPrefs,
  saveStoredDiscourses,
  saveStoredEvents,
  saveStoredFormTabs,
  saveStoredTips,
  triggerFileDownload,
} from './utils/storageAndExport';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DiscourseCatalog } from './components/DiscourseCatalog';
import { SayadawDirectory } from './components/SayadawDirectory';
import { MeditationTipsSection } from './components/MeditationTipsSection';
import { EventsCalendarSection } from './components/EventsCalendarSection';
import { FormsEmbedSection } from './components/FormsEmbedSection';
import { ReadingRoom } from './components/ReadingRoom';
import { GitHubPagesStudio } from './components/GitHubPagesStudio';
import { StoreTeachingModal } from './components/StoreTeachingModal';
import { AssistantRoleId, StudyAssistantDrawer } from './components/StudyAssistantDrawer';
import { Footer } from './components/Footer';

export default function App() {
  const [discourses, setDiscourses] = useState<DhammaDiscourse[]>(() =>
    loadStoredDiscourses(INITIAL_DISCOURSES),
  );
  const [tips, setTips] = useState<MeditationTip[]>(() =>
    loadStoredTips(INITIAL_MEDITATION_TIPS),
  );
  const [events, setEvents] = useState<GroupEvent[]>(() =>
    loadStoredEvents(INITIAL_GROUP_EVENTS),
  );
  const [formTabs, setFormTabs] = useState<GoogleFormTab[]>(() =>
    loadStoredFormTabs(INITIAL_FORM_TABS),
  );
  const [activeFormTabId, setActiveFormTabId] = useState<string>(
    () => formTabs[0]?.id || INITIAL_FORM_TABS[0].id,
  );

  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());
  const [prefs, setPrefs] = useState<ReaderPreferences>(() => loadReaderPrefs());

  const [viewMode, setViewMode] = useState<'home' | 'reader'>('home');
  const [activeNav, setActiveNav] = useState<NavSection>('discourses');
  const [activeDiscourseId, setActiveDiscourseId] = useState<string>(
    () => discourses[0]?.id || INITIAL_DISCOURSES[0].id,
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<TraditionCollection | 'All'>('All');
  const [selectedSayadawId, setSelectedSayadawId] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<DiscourseLanguage | 'All'>('All');
  const [onlySaved, setOnlySaved] = useState(false);

  // Store / Edit Discourse Modal
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingDiscourse, setEditingDiscourse] = useState<DhammaDiscourse | null>(null);

  // Study Assistant Drawer (Multi-Turn Gemini Chat + Google Search Grounding)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(
    undefined,
  );
  const [assistantInitialRole, setAssistantInitialRole] = useState<AssistantRoleId | undefined>(
    undefined,
  );

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
    saveStoredDiscourses(discourses);
  }, [discourses]);

  useEffect(() => {
    saveStoredTips(tips);
  }, [tips]);

  useEffect(() => {
    saveStoredEvents(events);
  }, [events]);

  useEffect(() => {
    saveStoredFormTabs(formTabs);
  }, [formTabs]);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const activeDiscourse =
    discourses.find((d) => d.id === activeDiscourseId) || discourses[0] || INITIAL_DISCOURSES[0];

  const handleOpenAssistant = (prompt?: string, role?: AssistantRoleId) => {
    setAssistantInitialPrompt(prompt);
    setAssistantInitialRole(role);
    setIsAssistantOpen(true);
  };

  const handleNavigate = (target: NavSection) => {
    setActiveNav(target);
    if (target === 'reader') {
      setViewMode('reader');
      return;
    }

    setViewMode('home');
    const sectionMap: Record<Exclude<NavSection, 'reader'>, string> = {
      discourses: 'catalog-section',
      sayadaws: 'sayadaws-section',
      tips: 'tips-section',
      events: 'events-section',
      forms: 'forms-section',
      github: 'github-section',
    };

    setTimeout(() => {
      const el = document.getElementById(sectionMap[target]);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
  };

  const handleSelectDiscourse = (id: string) => {
    setActiveDiscourseId(id);
    setViewMode('reader');
    setActiveNav('reader');
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleExportMarkdown = (discourse: DhammaDiscourse) => {
    const md = discourseToMarkdown(discourse);
    const filename = discourse.repoPath.split('/').pop() || `${discourse.id}.md`;
    triggerFileDownload(filename, md, 'text/markdown;charset=utf-8');
  };

  const handleFilterBySayadaw = (sayadawId: string) => {
    setSelectedSayadawId(sayadawId);
    setSelectedCollection('All');
    setOnlySaved(false);
    setViewMode('home');
    setActiveNav('discourses');
    setTimeout(() => {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 30);
  };

  const handleSaveTeaching = (discourse: DhammaDiscourse, isEdit: boolean) => {
    if (isEdit) {
      setDiscourses((prev) => prev.map((d) => (d.id === discourse.id ? discourse : d)));
    } else {
      setDiscourses((prev) => [discourse, ...prev]);
    }
    setIsStoreModalOpen(false);
    setEditingDiscourse(null);
    setActiveDiscourseId(discourse.id);
    setViewMode('reader');
    setActiveNav('reader');
  };

  const handleDeleteDiscourse = (id: string) => {
    const remaining = discourses.filter((d) => d.id !== id);
    const nextList = remaining.length > 0 ? remaining : INITIAL_DISCOURSES;
    setDiscourses(nextList);
    setBookmarks((prev) => prev.filter((b) => b !== id));
    setActiveDiscourseId(nextList[0].id);
    setViewMode('home');
    setActiveNav('discourses');
  };

  const handleSaveTip = (tip: MeditationTip, isEdit: boolean) => {
    if (isEdit) {
      setTips((prev) => prev.map((t) => (t.id === tip.id ? tip : t)));
    } else {
      setTips((prev) => [tip, ...prev]);
    }
  };

  const handleDeleteTip = (id: string) => {
    setTips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveEvent = (evt: GroupEvent, isEdit: boolean) => {
    if (isEdit) {
      setEvents((prev) => prev.map((e) => (e.id === evt.id ? evt : e)));
    } else {
      setEvents((prev) => [evt, ...prev]);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleRegisterWithForm = (formTabId: string) => {
    if (formTabs.some((t) => t.id === formTabId)) {
      setActiveFormTabId(formTabId);
    }
    handleNavigate('forms');
  };

  const handleSaveFormTab = (tab: GoogleFormTab, isNew: boolean) => {
    if (isNew) {
      setFormTabs((prev) => [...prev, tab]);
    } else {
      setFormTabs((prev) => prev.map((t) => (t.id === tab.id ? tab : t)));
    }
  };

  const handleDeleteFormTab = (id: string) => {
    const remaining = formTabs.filter((t) => t.id !== id);
    if (remaining.length === 0) return;
    setFormTabs(remaining);
    if (activeFormTabId === id) {
      setActiveFormTabId(remaining[0].id);
    }
  };

  const handleResetArchive = () => {
    clearAllStoredArchive();
    setDiscourses(INITIAL_DISCOURSES);
    setTips(INITIAL_MEDITATION_TIPS);
    setEvents(INITIAL_GROUP_EVENTS);
    setFormTabs(INITIAL_FORM_TABS);
    setActiveFormTabId(INITIAL_FORM_TABS[0].id);
    setActiveDiscourseId(INITIAL_DISCOURSES[0].id);
    setSelectedSayadawId('All');
    setSelectedCollection('All');
    setSelectedLanguage('All');
    setSearchQuery('');
    setOnlySaved(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#181512] text-[#1C1917] dark:text-[#F5F5F4] transition-colors duration-200">
      <Header
        activeSection={viewMode === 'reader' ? 'reader' : activeNav}
        onNavigate={handleNavigate}
        onOpenStoreModal={() => {
          setEditingDiscourse(null);
          setIsStoreModalOpen(true);
        }}
      />

      <main className="flex-1">
        {viewMode === 'reader' ? (
          <ReadingRoom
            discourse={activeDiscourse}
            allDiscourses={discourses}
            isBookmarked={bookmarks.includes(activeDiscourse.id)}
            prefs={prefs}
            onUpdatePrefs={setPrefs}
            onBackToCatalog={() => handleNavigate('discourses')}
            onSelectDiscourse={handleSelectDiscourse}
            onToggleBookmark={handleToggleBookmark}
            onExportMarkdown={handleExportMarkdown}
            onEditDiscourse={(d) => {
              setEditingDiscourse(d);
              setIsStoreModalOpen(true);
            }}
            onDeleteDiscourse={handleDeleteDiscourse}
            onOpenAssistant={(prompt) => handleOpenAssistant(prompt, 'discourse-guide')}
          />
        ) : (
          <>
            <HeroSection
              totalDiscourses={discourses.length}
              totalTips={tips.length}
              totalEvents={events.length}
              onEnterReadingRoom={() => handleSelectDiscourse(activeDiscourse.id)}
              onExploreEvents={() => handleNavigate('events')}
              onOpenGitHubStudio={() => handleNavigate('github')}
            />

            <DiscourseCatalog
              discourses={discourses}
              sayadaws={SAYADAW_PROFILES}
              bookmarks={bookmarks}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCollection={selectedCollection}
              onCollectionChange={setSelectedCollection}
              selectedSayadawId={selectedSayadawId}
              onSayadawChange={setSelectedSayadawId}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              onlySaved={onlySaved}
              onToggleOnlySaved={() => setOnlySaved((prev) => !prev)}
              darkMode={prefs.darkMode}
              onToggleDarkMode={() => setPrefs((p) => ({ ...p, darkMode: !p.darkMode }))}
              onSelectDiscourse={handleSelectDiscourse}
              onToggleBookmark={handleToggleBookmark}
              onExportMarkdown={handleExportMarkdown}
              onOpenStoreModal={() => {
                setEditingDiscourse(null);
                setIsStoreModalOpen(true);
              }}
              onOpenAssistant={(prompt) => handleOpenAssistant(prompt, 'quick-study')}
            />

            <SayadawDirectory
              sayadaws={SAYADAW_PROFILES}
              discourses={discourses}
              onFilterBySayadaw={handleFilterBySayadaw}
              onResearchSayadaw={(sayadawName) =>
                handleOpenAssistant(
                  `Search for background, major Dhamma publications, and teaching lineage of ${sayadawName}.`,
                  'web-research',
                )
              }
            />

            <MeditationTipsSection
              tips={tips}
              onSaveTip={handleSaveTip}
              onDeleteTip={handleDeleteTip}
            />

            <EventsCalendarSection
              events={events}
              formTabs={formTabs}
              onSaveEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
              onRegisterWithForm={handleRegisterWithForm}
            />

            <FormsEmbedSection
              formTabs={formTabs}
              activeTabId={activeFormTabId}
              onSelectTab={setActiveFormTabId}
              onSaveFormTab={handleSaveFormTab}
              onDeleteFormTab={handleDeleteFormTab}
            />

            <GitHubPagesStudio
              discourses={discourses}
              tips={tips}
              events={events}
              onExportMarkdown={handleExportMarkdown}
            />
          </>
        )}
      </main>

      <Footer onNavigate={handleNavigate} onResetArchive={handleResetArchive} />

      {/* Quiet floating Study Assistant launch button */}
      {!isAssistantOpen && (
        <button
          type="button"
          onClick={() => handleOpenAssistant()}
          aria-label="Open Dhamma Study Assistant"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] border border-[#D6CEBE]/30 shadow-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span>Study Assistant</span>
        </button>
      )}

      <StudyAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        discourses={discourses}
        initialPrompt={assistantInitialPrompt}
        initialRole={assistantInitialRole}
      />

      <StoreTeachingModal
        isOpen={isStoreModalOpen}
        editingDiscourse={editingDiscourse}
        sayadaws={SAYADAW_PROFILES}
        existingCount={discourses.length}
        onClose={() => {
          setIsStoreModalOpen(false);
          setEditingDiscourse(null);
        }}
        onSave={handleSaveTeaching}
      />
    </div>
  );
}
