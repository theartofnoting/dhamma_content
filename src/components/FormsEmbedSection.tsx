import { useEffect, useState } from 'react';
import { ExternalLink, FileSpreadsheet, Plus, Settings2 } from 'lucide-react';
import { SITE_CONFIG, TAXONOMY } from '../config/siteConfig';
import { normalizeGoogleFormUrl } from '../plugins/mediaResolver';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { EditorModal } from '../theme/components/EditorModal';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { GoogleFormTab } from '../types/dhamma';

interface FormsEmbedSectionProps {
  formTabs: GoogleFormTab[];
  activeTabId: string;
  isOwner: boolean;
  onSelectTab: (id: string) => void;
  onSaveFormTab: (tab: GoogleFormTab, isNew: boolean) => void;
  onDeleteFormTab: (id: string) => void;
}

export function FormsEmbedSection({
  formTabs,
  activeTabId,
  isOwner,
  onSelectTab,
  onSaveFormTab,
  onDeleteFormTab,
}: FormsEmbedSectionProps) {
  const activeTab = formTabs.find((t) => t.id === activeTabId) || formTabs[0];

  const [urlInput, setUrlInput] = useState(activeTab?.rawUrl || '');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSavedNotice, setUrlSavedNotice] = useState(false);
  const [showConfigBar, setShowConfigBar] = useState(false);
  const [confirmDeleteTabId, setConfirmDeleteTabId] = useState<string | null>(null);

  const [isNewTabModalOpen, setIsNewTabModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newTabError, setNewTabError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.rawUrl);
      setUrlError(null);
      setUrlSavedNotice(false);
      setShowConfigBar(isOwner && !activeTab.embedUrl);
    }
  }, [activeTab?.id, isOwner]);

  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setNewTabError('Please enter a label for the form tab.');
      return;
    }

    const result = normalizeGoogleFormUrl(newUrl);
    if (!result.ok) {
      setNewTabError(result.error || 'Invalid Google Form URL.');
      return;
    }

    const tab: GoogleFormTab = {
      id: `form-${Date.now()}`,
      label: newLabel.trim(),
      description:
        newDesc.trim() ||
        `Community submission form embedded for ${SITE_CONFIG.brandTitle} participants.`,
      rawUrl: newUrl.trim(),
      embedUrl: result.embedUrl || '',
      heightPx: 760,
    };

    onSaveFormTab(tab, true);
    onSelectTab(tab.id);
    setIsNewTabModalOpen(false);
    setNewLabel('');
    setNewDesc('');
    setNewUrl('');
    setNewTabError(null);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTab) return;
    setUrlError(null);
    const result = normalizeGoogleFormUrl(urlInput);
    if (!result.ok) {
      setUrlError(result.error || 'Invalid Google Form URL.');
      return;
    }

    onSaveFormTab(
      {
        ...activeTab,
        rawUrl: urlInput.trim(),
        embedUrl: result.embedUrl || '',
      },
      false,
    );
    setUrlSavedNotice(true);
    if (result.embedUrl) {
      setShowConfigBar(false);
    }
    setTimeout(() => setUrlSavedNotice(false), 2200);
  };

  const handleClearUrl = () => {
    if (!activeTab) return;
    setUrlInput('');
    setUrlError(null);
    onSaveFormTab(
      {
        ...activeTab,
        rawUrl: '',
        embedUrl: '',
      },
      false,
    );
    setShowConfigBar(true);
  };

  const handleHeightChange = (heightPx: number) => {
    if (!activeTab) return;
    onSaveFormTab({ ...activeTab, heightPx }, false);
  };

  return (
    <section
      id="forms-section"
      className={`border-t ${THEME_CLASSES.borderHairline} ${THEME_CLASSES.sectionContainer}`}
    >
      <SectionHeader
        kicker="05. Group Submissions"
        title="Community Registration & Submission Forms"
        description={
          isOwner
            ? 'Configure Google Form URLs below to embed live registration, Sayadaw Q&A, or volunteer forms.'
            : 'Submit retreat registrations, Sayadaw Dhamma questions, or group volunteer sign-ups using the official forms below.'
        }
        actions={
          isOwner ? (
            <button
              type="button"
              onClick={() => {
                setNewTabError(null);
                setIsNewTabModalOpen(true);
              }}
              className={THEME_CLASSES.btnPrimary}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Form Tab</span>
            </button>
          ) : undefined
        }
      />

      {!activeTab ? (
        <div className="py-12 text-center space-y-3">
          <p className={`font-display text-2xl font-medium ${THEME_CLASSES.inkPrimary}`}>
            No registration forms added yet
          </p>
        </div>
      ) : (
        <>
          <div
            className={`flex flex-wrap items-center justify-between gap-4 py-5 border-b ${THEME_CLASSES.borderHairline}`}
          >
            <div role="tablist" aria-label="Google Form tabs" className="flex flex-wrap items-center gap-1.5">
              {formTabs.map((tab) => {
                const active = tab.id === activeTab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onSelectTab(tab.id)}
                    className={`min-h-[40px] px-4 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                        : 'bg-[var(--surface-muted)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {isOwner && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigBar((prev) => !prev)}
                  className={THEME_CLASSES.btnOutline}
                >
                  <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{showConfigBar ? 'Hide Form URL' : 'Configure Form URL'}</span>
                </button>

                <ConfirmDeleteAction
                  isConfirming={confirmDeleteTabId === activeTab.id}
                  onRequestConfirm={() => setConfirmDeleteTabId(activeTab.id)}
                  onConfirm={() => {
                    onDeleteFormTab(activeTab.id);
                    setConfirmDeleteTabId(null);
                  }}
                  onCancel={() => setConfirmDeleteTabId(null)}
                  label="Remove Tab"
                  confirmLabel="Confirm Remove"
                  ariaLabel={`Remove ${activeTab.label}`}
                  variant="button"
                />
              </div>
            )}
          </div>

          <div className="pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                  {activeTab.label}
                </h3>
                <p className={`text-sm ${THEME_CLASSES.inkMuted} max-w-2xl`}>
                  {activeTab.description}
                </p>
              </div>

              {activeTab.embedUrl && (
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {isOwner && (
                    <div
                      role="group"
                      aria-label="Form embed height"
                      className={`flex items-center border ${THEME_CLASSES.borderStrong}`}
                    >
                      {TAXONOMY.formHeightOptions.map((opt) => (
                        <button
                          key={opt.px}
                          type="button"
                          onClick={() => handleHeightChange(opt.px)}
                          className={`min-h-[36px] px-2.5 text-xs cursor-pointer transition-colors ${
                            activeTab.heightPx === opt.px
                              ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                              : THEME_CLASSES.inkMuted
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <a
                    href={activeTab.rawUrl || activeTab.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.accentInk} hover:border-[var(--accent-ink)] whitespace-nowrap shrink-0`}
                  >
                    <span>Open Form in New Tab</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>

            {isOwner && showConfigBar && (
              <form
                onSubmit={handleApplyUrl}
                className={`p-5 ${THEME_CLASSES.card} space-y-3`}
              >
                <label
                  htmlFor="google-form-url-input"
                  className={`block text-xs font-medium ${THEME_CLASSES.inkPrimary}`}
                >
                  Google Form Link or Embed Code for “{activeTab.label}”
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="google-form-url-input"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/forms/d/e/.../viewform"
                    className={`${THEME_CLASSES.inputMono} flex-1`}
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="submit" className={THEME_CLASSES.btnAccent}>
                      Save &amp; Embed
                    </button>
                    {activeTab.embedUrl && (
                      <button
                        type="button"
                        onClick={handleClearUrl}
                        className={THEME_CLASSES.btnSecondary}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {urlError && (
                  <p role="alert" className={`text-xs ${THEME_CLASSES.dangerInk}`}>
                    {urlError}
                  </p>
                )}

                {urlSavedNotice && (
                  <p className={`text-xs ${THEME_CLASSES.successInk}`}>
                    Form URL saved to this tab.
                  </p>
                )}
              </form>
            )}

            {activeTab.embedUrl ? (
              <div className={`border ${THEME_CLASSES.borderStrong} bg-white`}>
                <iframe
                  key={activeTab.embedUrl}
                  src={activeTab.embedUrl}
                  title={activeTab.label}
                  width="100%"
                  height={activeTab.heightPx}
                  frameBorder={0}
                  marginHeight={0}
                  marginWidth={0}
                  className="w-full block"
                >
                  Loading Google Form…
                </iframe>
              </div>
            ) : (
              <div
                className={`p-10 sm:p-14 border border-dashed ${THEME_CLASSES.borderStrong} bg-[var(--surface-band)] text-center space-y-3`}
              >
                <FileSpreadsheet
                  className={`h-8 w-8 mx-auto ${THEME_CLASSES.accentInk}`}
                  aria-hidden="true"
                />
                <h4 className={`font-display text-2xl font-medium ${THEME_CLASSES.inkPrimary}`}>
                  {isOwner
                    ? `Ready to Embed “${activeTab.label}”`
                    : `${activeTab.label} — Opening Soon`}
                </h4>
                <p className={`text-sm ${THEME_CLASSES.inkMuted} max-w-lg mx-auto leading-relaxed`}>
                  {isOwner
                    ? 'Paste your group’s Google Form URL in the box above and click Save & Embed. Once saved, participants can fill out and submit the form directly on this page.'
                    : 'This registration form has not been published by the group coordinator yet. Check the Courses & Events calendar above or return shortly.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {isOwner && (
        <EditorModal
          isOpen={isNewTabModalOpen}
          headingId="new-form-tab-heading"
          kicker="Multi-Form Setup"
          title="Add Google Form Tab"
          maxWidthClassName="max-w-lg"
          error={newTabError}
          onClose={() => setIsNewTabModalOpen(false)}
        >
          <form onSubmit={handleCreateTab} className="space-y-4">
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Tab Name *</label>
              <input
                type="text"
                required
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., 10-Day Retreat Intake"
                className={THEME_CLASSES.input}
              />
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Purpose of this form for practitioners..."
                className={THEME_CLASSES.input}
              />
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>
                Google Form URL (Optional — can be added later)
              </label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                className={THEME_CLASSES.inputMono}
              />
            </div>

            <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} flex justify-end gap-3`}>
              <button
                type="button"
                onClick={() => setIsNewTabModalOpen(false)}
                className={THEME_CLASSES.btnSecondary}
              >
                Cancel
              </button>
              <button type="submit" className={THEME_CLASSES.btnAccent}>
                Create Form Tab
              </button>
            </div>
          </form>
        </EditorModal>
      )}
    </section>
  );
}
