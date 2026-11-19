import { useEffect, useState } from 'react';
import { ExternalLink, FileSpreadsheet, Plus, Settings2, Trash2, X } from 'lucide-react';
import { GoogleFormTab } from '../types/dhamma';
import { normalizeGoogleFormUrl } from '../utils/storageAndExport';

interface FormsEmbedSectionProps {
  formTabs: GoogleFormTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onSaveFormTab: (tab: GoogleFormTab, isNew: boolean) => void;
  onDeleteFormTab: (id: string) => void;
}

export function FormsEmbedSection({
  formTabs,
  activeTabId,
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

  // Add new form tab modal
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
      // Automatically open URL input bar if this tab has no Google Form URL configured yet
      setShowConfigBar(!activeTab.embedUrl);
    }
  }, [activeTab?.id]);

  if (!activeTab) return null;

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
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
    onSaveFormTab({ ...activeTab, heightPx }, false);
  };

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
        newDesc.trim() || 'Community submission form embedded for Vipassana Bhavana participants.',
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

  return (
    <section
      id="forms-section"
      className="border-t border-[#E5DFD3] dark:border-[#342E28] mx-auto max-w-[1200px] px-4 py-14 sm:px-8 sm:py-16"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5DFD3] dark:border-[#342E28]">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
            05. Group Submissions
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] text-balance">
            Community Registration &amp; Submission Forms
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
            Paste any Google Form URL into a tab below to embed live registration, Sayadaw Q&amp;A,
            or volunteer forms directly on the Dhamma Page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewTabError(null);
            setIsNewTabModalOpen(true);
          }}
          className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Form Tab</span>
        </button>
      </div>

      {/* Multi-Form Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-[#E5DFD3] dark:border-[#342E28]">
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
                    ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                    : 'bg-[#F4EFE6] text-[#57534E] hover:text-[#1C1917] dark:bg-[#25211D] dark:text-[#A8A29E] dark:hover:text-[#F5F5F4]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowConfigBar((prev) => !prev)}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#9A3412] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{showConfigBar ? 'Hide Form URL' : 'Configure Form URL'}</span>
          </button>

          {formTabs.length > 1 && (
            <>
              {confirmDeleteTabId !== activeTab.id ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteTabId(activeTab.id)}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#57534E] hover:text-[#9A3412] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Remove Tab</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteFormTab(activeTab.id);
                      setConfirmDeleteTabId(null);
                    }}
                    className="min-h-[38px] px-3 bg-[#9A3412] text-[#FBF9F5] cursor-pointer"
                  >
                    Confirm Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteTabId(null)}
                    className="px-2 text-[#57534E] cursor-pointer"
                  >
                    Cancel
                  </button>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Active Form Description & Controls */}
      <div className="pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
              {activeTab.label}
            </h3>
            <p className="text-sm text-[#57534E] dark:text-[#A8A29E] max-w-2xl">
              {activeTab.description}
            </p>
          </div>

          {activeTab.embedUrl && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div
                role="group"
                aria-label="Form embed height"
                className="flex items-center border border-[#D6CEBE] dark:border-[#44403C]"
              >
                {[
                  { label: 'Compact', px: 560 },
                  { label: 'Standard', px: 760 },
                  { label: 'Tall', px: 960 },
                ].map((opt) => (
                  <button
                    key={opt.px}
                    type="button"
                    onClick={() => handleHeightChange(opt.px)}
                    className={`min-h-[36px] px-2.5 text-xs cursor-pointer transition-colors ${
                      activeTab.heightPx === opt.px
                        ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                        : 'text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <a
                href={activeTab.rawUrl || activeTab.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#9A3412] dark:text-[#FDBA74] hover:border-[#9A3412] whitespace-nowrap shrink-0"
              >
                <span>Open Form in New Tab</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>

        {/* URL Configuration Bar */}
        {showConfigBar && (
          <form
            onSubmit={handleApplyUrl}
            className="p-5 border border-[#D6CEBE] dark:border-[#342E28] bg-[#F4EFE6]/55 dark:bg-[#1E1A16] space-y-3"
          >
            <label
              htmlFor="google-form-url-input"
              className="block text-xs font-medium text-[#1C1917] dark:text-[#F5F5F4]"
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
                className="flex-1 min-h-[42px] px-3 py-2 font-mono-code text-xs bg-[#FBF9F5] dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] cursor-pointer whitespace-nowrap"
                >
                  Save &amp; Embed
                </button>
                {activeTab.embedUrl && (
                  <button
                    type="button"
                    onClick={handleClearUrl}
                    className="min-h-[42px] px-3 py-2 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#57534E] dark:text-[#A8A29E] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {urlError && (
              <p role="alert" className="text-xs text-[#9A3412] dark:text-[#FCA5A5]">
                {urlError}
              </p>
            )}

            {urlSavedNotice && (
              <p className="text-xs text-[#14532D] dark:text-[#86EFAC]">
                Form URL saved to this tab.
              </p>
            )}

            <p className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
              Tip: In Google Forms, click <strong>Send</strong> → choose the{' '}
              <strong>Embed HTML (&lt; &gt;)</strong> or <strong>Link</strong> tab, copy the full{' '}
              <span className="font-mono-code">https://docs.google.com/forms/d/e/.../viewform</span>{' '}
              URL (or paste the entire &lt;iframe&gt; snippet), and save.
            </p>
          </form>
        )}

        {/* Live Google Form Iframe or Ready-to-Configure State */}
        {activeTab.embedUrl ? (
          <div className="border border-[#D6CEBE] dark:border-[#342E28] bg-white">
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
          <div className="p-10 sm:p-14 border border-dashed border-[#D6CEBE] dark:border-[#3F3832] bg-[#F4EFE6]/30 dark:bg-[#1E1A16]/60 text-center space-y-3">
            <FileSpreadsheet
              className="h-8 w-8 mx-auto text-[#9A3412]/80 dark:text-[#FDBA74]"
              aria-hidden="true"
            />
            <h4 className="font-display text-2xl font-medium text-[#1C1917] dark:text-[#F5F5F4]">
              Ready to Embed “{activeTab.label}”
            </h4>
            <p className="text-sm text-[#57534E] dark:text-[#A8A29E] max-w-lg mx-auto leading-relaxed">
              Paste your group’s Google Form URL in the box above and click{' '}
              <strong>Save &amp; Embed</strong>. Once saved, participants can fill out and submit
              the form directly on this page.
            </p>
          </div>
        )}
      </div>

      {/* Add New Form Tab Modal */}
      {isNewTabModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-form-tab-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4"
        >
          <div className="w-full max-w-lg bg-[#FBF9F5] dark:bg-[#181512] border border-[#D6CEBE] dark:border-[#342E28] p-6 sm:p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFD3] dark:border-[#342E28]">
              <div>
                <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
                  Multi-Form Setup
                </p>
                <h3
                  id="new-form-tab-heading"
                  className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]"
                >
                  Add Google Form Tab
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTabModalOpen(false)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTab} className="pt-5 space-y-4">
              {newTabError && (
                <div
                  role="alert"
                  className="p-3 border border-[#9A3412]/50 bg-[#9A3412]/5 text-xs text-[#9A3412] dark:text-[#FCA5A5]"
                >
                  {newTabError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Tab Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., 10-Day Retreat Intake"
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Purpose of this form for practitioners..."
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Google Form URL (Optional — can be added later)
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  className="w-full min-h-[42px] px-3 py-2 font-mono-code text-xs bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5DFD3] dark:border-[#342E28] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewTabModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] cursor-pointer"
                >
                  Create Form Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
