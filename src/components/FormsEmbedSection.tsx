import { useEffect, useState } from 'react';
import { ExternalLink, FileSpreadsheet, Plus, Settings2 } from 'lucide-react';
import { SECTION_IDS, TAXONOMY } from '../config/siteConfig';
import { LocaleDictionary } from '../i18n';
import { normalizeGoogleFormUrl } from '../plugins/mediaResolver';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { EditorModal } from '../theme/components/EditorModal';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { GoogleFormTab } from '../types/dhamma';

interface FormsEmbedSectionProps {
  dict: LocaleDictionary;
  formTabs: GoogleFormTab[];
  activeTabId: string;
  isOwner: boolean;
  onSelectTab: (id: string) => void;
  onSaveFormTab: (tab: GoogleFormTab, isNew: boolean) => void;
  onDeleteFormTab: (id: string) => void;
}

export function FormsEmbedSection({
  dict,
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
  const [urlSaved, setUrlSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<GoogleFormTab | null>(null);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [modalRawUrl, setModalRawUrl] = useState('');
  const [heightPx, setHeightPx] = useState<number>(760);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setUrlInput(activeTab?.rawUrl || '');
    setUrlError(null);
    setUrlSaved(false);
    setConfirmDelete(false);
  }, [activeTab?.id, activeTab?.rawUrl]);

  const handleQuickUrlSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTab) return;
    const normalized = normalizeGoogleFormUrl(urlInput);
    if (!normalized.ok) {
      setUrlError(normalized.error || 'Invalid Google Form URL.');
      return;
    }
    setUrlError(null);
    onSaveFormTab(
      {
        ...activeTab,
        rawUrl: urlInput.trim(),
        embedUrl: normalized.embedUrl || '',
      },
      false,
    );
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 1800);
  };

  const openCreateModal = () => {
    setEditingTab(null);
    setLabel('');
    setDescription('');
    setModalRawUrl('');
    setHeightPx(760);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tab: GoogleFormTab) => {
    setEditingTab(tab);
    setLabel(tab.label);
    setDescription(tab.description);
    setModalRawUrl(tab.rawUrl);
    setHeightPx(tab.heightPx);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setModalError('Form tab label is required.');
      return;
    }
    const normalized = normalizeGoogleFormUrl(modalRawUrl);
    if (!normalized.ok) {
      setModalError(normalized.error || 'Invalid Google Form URL.');
      return;
    }

    const payload: GoogleFormTab = {
      id: editingTab ? editingTab.id : `form-${Date.now()}`,
      label: label.trim(),
      description: description.trim(),
      rawUrl: modalRawUrl.trim(),
      embedUrl: normalized.embedUrl || '',
      heightPx,
      isDefault: editingTab?.isDefault,
    };

    onSaveFormTab(payload, !editingTab);
    onSelectTab(payload.id);
    setIsModalOpen(false);
  };

  return (
    <section id={SECTION_IDS.forms} className={THEME_CLASSES.sectionContainer}>
      <SectionHeader
        kicker={dict.forms.kicker}
        title={dict.forms.title}
        description={dict.forms.description}
        actions={
          isOwner ? (
            <button type="button" onClick={openCreateModal} className={THEME_CLASSES.btnAccent}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{dict.forms.addTab}</span>
            </button>
          ) : undefined
        }
      />

      {formTabs.length === 0 ? (
        <p className={`py-12 text-center text-sm ${THEME_CLASSES.inkMuted}`}>
          {dict.forms.emptyTabs}
        </p>
      ) : (
        <div className="pt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {formTabs.map((tab) => {
              const isSelected = activeTab?.id === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`min-h-[40px] px-4 py-2 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)] border-[var(--ink-primary)]'
                      : `${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)]`
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab && (
            <div className={`p-6 ${THEME_CLASSES.card} space-y-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                    {activeTab.label}
                  </h3>
                  {activeTab.description && (
                    <p className={`text-sm leading-relaxed ${THEME_CLASSES.inkSecondary}`}>
                      {activeTab.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeTab.rawUrl && (
                    <a
                      href={activeTab.rawUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={THEME_CLASSES.btnOutline}
                    >
                      <span>{dict.forms.openInNewTab}</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                  {isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(activeTab)}
                        className={THEME_CLASSES.btnOutline}
                      >
                        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{dict.sayadaws.edit}</span>
                      </button>
                      <ConfirmDeleteAction
                        isConfirming={confirmDelete}
                        onRequestConfirm={() => setConfirmDelete(true)}
                        onConfirm={() => {
                          onDeleteFormTab(activeTab.id);
                          setConfirmDelete(false);
                        }}
                        onCancel={() => setConfirmDelete(false)}
                        confirmLabel={dict.catalog.confirmDelete}
                        cancelLabel={dict.sayadaws.cancelBtn}
                        variant="button"
                      />
                    </>
                  )}
                </div>
              </div>

              {isOwner && (
                <form
                  onSubmit={handleQuickUrlSave}
                  className={`p-4 border ${THEME_CLASSES.borderHairline} bg-[var(--surface-canvas)] space-y-2.5`}
                >
                  <label className={THEME_CLASSES.label}>{dict.forms.configureUrl}</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://docs.google.com/forms/d/e/.../viewform"
                      className={`flex-1 ${THEME_CLASSES.inputMono}`}
                    />
                    <button type="submit" className={THEME_CLASSES.btnPrimary}>
                      {urlSaved ? 'Saved' : 'Apply URL'}
                    </button>
                  </div>
                  {urlError && (
                    <p role="alert" className={`text-xs ${THEME_CLASSES.dangerInk}`}>
                      {urlError}
                    </p>
                  )}
                </form>
              )}

              {activeTab.embedUrl ? (
                <div className={`border ${THEME_CLASSES.borderStrong} bg-white`}>
                  <iframe
                    src={activeTab.embedUrl}
                    title={activeTab.label}
                    style={{ height: `${activeTab.heightPx}px` }}
                    className="w-full border-0"
                    loading="lazy"
                  >
                    Loading form...
                  </iframe>
                </div>
              ) : (
                <div
                  className={`py-14 px-6 border border-dashed ${THEME_CLASSES.borderStrong} text-center space-y-2`}
                >
                  <FileSpreadsheet
                    className={`h-7 w-7 mx-auto ${THEME_CLASSES.inkSubtle}`}
                    aria-hidden="true"
                  />
                  <p className={`text-sm ${THEME_CLASSES.inkMuted}`}>
                    {dict.forms.noUrlPlaceholder}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isOwner && (
        <EditorModal
          isOpen={isModalOpen}
          headingId="form-tab-modal-heading"
          kicker="Submission Forms"
          title={editingTab ? 'Edit Form Tab' : 'Add Form Tab'}
          error={modalError}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleModalSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Tab Label *</label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={THEME_CLASSES.input}
              />
            </div>
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={THEME_CLASSES.textarea}
              />
            </div>
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Google Form URL</label>
              <input
                type="text"
                value={modalRawUrl}
                onChange={(e) => setModalRawUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                className={THEME_CLASSES.inputMono}
              />
            </div>
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Frame Height</label>
              <select
                value={heightPx}
                onChange={(e) => setHeightPx(Number(e.target.value))}
                className={THEME_CLASSES.input}
              >
                {TAXONOMY.formHeightOptions.map((opt) => (
                  <option key={opt.key} value={opt.px}>
                    {opt.key} ({opt.px}px)
                  </option>
                ))}
              </select>
            </div>
            <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} flex justify-end gap-3`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={THEME_CLASSES.btnSecondary}
              >
                {dict.sayadaws.cancelBtn}
              </button>
              <button type="submit" className={THEME_CLASSES.btnAccent}>
                {editingTab ? 'Update Form' : 'Create Form'}
              </button>
            </div>
          </form>
        </EditorModal>
      )}
    </section>
  );
}
