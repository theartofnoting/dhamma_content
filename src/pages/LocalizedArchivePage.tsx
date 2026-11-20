import { DiscourseCatalog } from '../components/DiscourseCatalog';
import { EventsCalendarSection } from '../components/EventsCalendarSection';
import { Footer } from '../components/Footer';
import { FormsEmbedSection } from '../components/FormsEmbedSection';
import { GitHubPagesStudio } from '../components/GitHubPagesStudio';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { LoginPage } from '../components/LoginPage';
import { MeditationTipsSection } from '../components/MeditationTipsSection';
import { OwnerSessionBar } from '../components/OwnerSessionBar';
import { ReadingRoom } from '../components/ReadingRoom';
import { SayadawDirectory } from '../components/SayadawDirectory';
import { StoreTeachingModal } from '../components/StoreTeachingModal';
import { getLocaleDictionary } from '../i18n';
import { THEME_CLASSES } from '../theme/uiClasses';
import { useArchiveState } from '../tools/useArchiveState';
import { SiteLocale } from '../types/dhamma';

export type ArchiveStateController = ReturnType<typeof useArchiveState>;

export interface LocalizedPageProps {
  archive: ArchiveStateController;
}

interface LocalizedArchivePageProps extends LocalizedPageProps {
  locale: SiteLocale;
}

export function LocalizedArchivePage({ locale, archive }: LocalizedArchivePageProps) {
  const dict = getLocaleDictionary(locale);

  return (
    <div
      lang={locale}
      className={`min-h-screen flex flex-col ${THEME_CLASSES.canvas} transition-colors duration-200`}
    >
      <Header
        activeSection={archive.viewMode === 'reader' ? 'reader' : archive.activeNav}
        isOwner={archive.auth.isOwner}
        dict={dict}
        onNavigate={archive.navigate}
        onOpenStoreModal={() =>
          archive.openStoreModal(
            archive.selectedSayadawId !== 'All' ? archive.selectedSayadawId : undefined,
          )
        }
      />

      {archive.auth.isOwner && (
        <OwnerSessionBar
          auth={archive.auth}
          hasUnpublishedChanges={archive.hasUnpublishedChanges}
          pendingDeletionCount={archive.deletedPaths.length}
          isPublishing={archive.isPublishing}
          publishStatus={archive.publishStatus}
          publishError={archive.publishError}
          lastActionsUrl={archive.lastActionsUrl}
          onPublishToGitHub={archive.publishToGitHub}
          onOpenGitHubStudio={() => archive.navigate('github')}
          onLogout={archive.logout}
        />
      )}

      <main className="flex-1">
        {archive.viewMode === 'login' ? (
          <LoginPage
            auth={archive.auth}
            onPatSuccess={archive.loginWithPat}
            onLogout={archive.logout}
            onBackToArchive={() => archive.navigate('discourses')}
          />
        ) : archive.viewMode === 'not-found' ? (
          <section className="mx-auto max-w-[780px] px-4 py-20 sm:px-8 text-center space-y-5">
            <p className={`font-mono-code text-xs uppercase tracking-widest ${THEME_CLASSES.accentInk}`}>
              {dict.notFound.kicker}
            </p>
            <h1 className={`font-display text-3xl sm:text-4xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
              {dict.notFound.headline}
            </h1>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => archive.navigate('discourses')}
                className={THEME_CLASSES.btnPrimary}
              >
                {dict.notFound.returnHome}
              </button>
            </div>
          </section>
        ) : archive.viewMode === 'reader' && archive.activeDiscourse ? (
          <ReadingRoom
            locale={locale}
            dict={dict}
            discourse={archive.activeDiscourse}
            allDiscourses={archive.discourses}
            sayadaws={archive.indexedSayadaws}
            isBookmarked={archive.bookmarks.includes(archive.activeDiscourse.id)}
            isOwner={archive.auth.isOwner}
            prefs={archive.prefs}
            onUpdatePrefs={archive.setPrefs}
            onBackToCatalog={() => archive.navigate('discourses')}
            onSelectDiscourse={archive.selectDiscourse}
            onFilterBySayadaw={archive.filterBySayadaw}
            onToggleBookmark={archive.toggleBookmark}
            onExportMarkdown={archive.exportMarkdown}
            onEditDiscourse={(d) => archive.openStoreModal(undefined, d)}
            onDeleteDiscourse={archive.deleteDiscourse}
          />
        ) : (
          <>
            <HeroSection
              locale={locale}
              dict={dict}
              totalDiscourses={archive.discourses.length}
              totalSayadaws={archive.indexedSayadaws.length}
              totalTips={archive.tips.length}
              totalEvents={archive.events.length}
              isOwner={archive.auth.isOwner}
              onSelectLocale={archive.switchLocale}
              onEnterReadingRoom={() =>
                archive.activeDiscourse
                  ? archive.selectDiscourse(archive.activeDiscourse.id)
                  : archive.navigate('discourses')
              }
              onExploreEvents={() => archive.navigate('events')}
              onOpenGitHubStudio={() => archive.navigate('github')}
            />
            <DiscourseCatalog
              dict={dict}
              discourses={archive.discourses}
              sayadaws={archive.indexedSayadaws}
              bookmarks={archive.bookmarks}
              isOwner={archive.auth.isOwner}
              searchQuery={archive.searchQuery}
              onSearchChange={archive.setSearchQuery}
              selectedCollection={archive.selectedCollection}
              onCollectionChange={archive.setSelectedCollection}
              selectedSayadawId={archive.selectedSayadawId}
              onSayadawChange={archive.changeSayadawFilter}
              selectedLanguage={archive.selectedLanguage}
              onLanguageChange={archive.setSelectedLanguage}
              onlySaved={archive.onlySaved}
              onToggleOnlySaved={archive.toggleOnlySaved}
              darkMode={archive.prefs.darkMode}
              onToggleDarkMode={() => archive.setPrefs((p) => ({ ...p, darkMode: !p.darkMode }))}
              onSelectDiscourse={archive.selectDiscourse}
              onToggleBookmark={archive.toggleBookmark}
              onExportMarkdown={archive.exportMarkdown}
              onEditDiscourse={(d) => archive.openStoreModal(undefined, d)}
              onDeleteDiscourse={archive.deleteDiscourse}
              onOpenStoreModal={(presetId) => archive.openStoreModal(presetId)}
            />
            <SayadawDirectory
              dict={dict}
              sayadaws={archive.indexedSayadaws}
              discourses={archive.discourses}
              isOwner={archive.auth.isOwner}
              onFilterBySayadaw={archive.filterBySayadaw}
              onSaveSayadaw={archive.saveSayadaw}
              onDeleteSayadaw={archive.deleteSayadaw}
            />
            <MeditationTipsSection
              dict={dict}
              tips={archive.tips}
              isOwner={archive.auth.isOwner}
              onSaveTip={archive.saveTip}
              onDeleteTip={archive.deleteTip}
            />
            <EventsCalendarSection
              dict={dict}
              events={archive.events}
              formTabs={archive.formTabs}
              isOwner={archive.auth.isOwner}
              onSaveEvent={archive.saveEvent}
              onDeleteEvent={archive.deleteEvent}
              onRegisterWithForm={archive.registerWithForm}
            />
            <FormsEmbedSection
              dict={dict}
              formTabs={archive.formTabs}
              activeTabId={archive.activeFormTabId}
              isOwner={archive.auth.isOwner}
              onSelectTab={archive.setActiveFormTabId}
              onSaveFormTab={archive.saveFormTab}
              onDeleteFormTab={archive.deleteFormTab}
            />
            {archive.auth.isOwner && (
              <GitHubPagesStudio
                sayadaws={archive.indexedSayadaws}
                discourses={archive.discourses}
                tips={archive.tips}
                events={archive.events}
                pendingDeletionCount={archive.deletedPaths.length}
                hasUnpublishedChanges={archive.hasUnpublishedChanges}
                isPublishing={archive.isPublishing}
                publishStatus={archive.publishStatus}
                publishError={archive.publishError}
                lastActionsUrl={archive.lastActionsUrl}
                onPublishToGitHub={archive.publishToGitHub}
                onExportMarkdown={archive.exportMarkdown}
              />
            )}
          </>
        )}
      </main>

      <Footer
        locale={locale}
        dict={dict}
        isOwner={archive.auth.isOwner}
        ownerLogin={archive.auth.user?.login}
        onSelectLocale={archive.switchLocale}
        onNavigate={archive.navigate}
        onResetArchive={archive.resetArchive}
      />

      {archive.auth.isOwner && (
        <StoreTeachingModal
          isOpen={archive.isStoreModalOpen}
          editingDiscourse={archive.editingDiscourse}
          presetSayadawId={archive.presetSayadawId}
          sayadaws={archive.indexedSayadaws}
          existingCount={archive.discourses.length}
          onClose={archive.closeStoreModal}
          onSave={archive.saveTeaching}
        />
      )}
    </div>
  );
}
