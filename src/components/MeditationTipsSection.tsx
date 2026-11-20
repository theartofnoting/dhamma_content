import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { SITE_CONFIG, TAXONOMY } from '../config/siteConfig';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { EditorModal } from '../theme/components/EditorModal';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { MeditationTip, TipCategory } from '../types/dhamma';

interface MeditationTipsSectionProps {
  tips: MeditationTip[];
  isOwner: boolean;
  onSaveTip: (tip: MeditationTip, isEdit: boolean) => void;
  onDeleteTip: (id: string) => void;
}

const TIP_FILTER_OPTIONS: (TipCategory | 'All')[] = ['All', ...TAXONOMY.tipCategories];

export function MeditationTipsSection({
  tips,
  isOwner,
  onSaveTip,
  onDeleteTip,
}: MeditationTipsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<TipCategory | 'All'>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<MeditationTip | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TipCategory>(TAXONOMY.tipCategories[0]);
  const [paliTerm, setPaliTerm] = useState('');
  const [durationHint, setDurationHint] = useState('');
  const [authorSayadaw, setAuthorSayadaw] = useState('');
  const [summary, setSummary] = useState('');
  const [guidanceText, setGuidanceText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredTips =
    selectedCategory === 'All' ? tips : tips.filter((t) => t.category === selectedCategory);

  const openCreateModal = () => {
    setEditingTip(null);
    setTitle('');
    setCategory(TAXONOMY.tipCategories[0]);
    setPaliTerm('');
    setDurationHint('20 min sitting');
    setAuthorSayadaw('Group Meditation Guidance');
    setSummary('');
    setGuidanceText('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tip: MeditationTip) => {
    setEditingTip(tip);
    setTitle(tip.title);
    setCategory(tip.category);
    setPaliTerm(tip.paliTerm || '');
    setDurationHint(tip.durationHint);
    setAuthorSayadaw(tip.authorSayadaw);
    setSummary(tip.summary);
    setGuidanceText(tip.guidance.join('\n\n'));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !guidanceText.trim()) {
      setFormError('Please provide both a title and practical meditation guidance.');
      return;
    }

    const paragraphs = guidanceText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const newTip: MeditationTip = {
      id: editingTip ? editingTip.id : `tip-${Date.now()}`,
      title: title.trim(),
      category,
      paliTerm: paliTerm.trim() || undefined,
      durationHint: durationHint.trim() || 'Daily practice',
      authorSayadaw: authorSayadaw.trim() || `${SITE_CONFIG.brandTitle} Guidance`,
      summary: summary.trim() || paragraphs[0] || title.trim(),
      guidance: paragraphs,
      updatedAt: new Date().toISOString().slice(0, 10),
      isUserCreated: true,
    };

    onSaveTip(newTip, Boolean(editingTip));
    setIsModalOpen(false);
  };

  return (
    <section
      id="tips-section"
      className={`border-t ${THEME_CLASSES.borderHairline} ${THEME_CLASSES.sectionContainer}`}
    >
      <SectionHeader
        kicker="03. Practice Guidance"
        title="Meditation Tips & Sitting Notes"
        description="Practical instructions from our Sayadaw lineage for sitting, walking, and meeting distractions with steady awareness."
        actions={
          isOwner ? (
            <button type="button" onClick={openCreateModal} className={THEME_CLASSES.btnPrimary}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Meditation Tip</span>
            </button>
          ) : undefined
        }
      />

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter meditation tips by category"
        className={`flex items-center gap-1.5 overflow-x-auto py-5 border-b ${THEME_CLASSES.borderHairline}`}
      >
        {TIP_FILTER_OPTIONS.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                  : 'bg-[var(--surface-muted)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {cat === 'All' ? 'All Practice Areas' : cat}
            </button>
          );
        })}
      </div>

      {filteredTips.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className={`font-display text-2xl font-medium ${THEME_CLASSES.inkPrimary}`}>
            No meditation tips in this category yet
          </p>
          {isOwner && (
            <button type="button" onClick={openCreateModal} className={THEME_CLASSES.btnAccent}>
              Add First Tip
            </button>
          )}
        </div>
      ) : (
        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredTips.map((tip) => (
            <article
              key={tip.id}
              className={`p-6 ${THEME_CLASSES.card} flex flex-col justify-between gap-6`}
            >
              <div className="space-y-4">
                <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkSubtle}`}>
                  <span className={`font-medium ${THEME_CLASSES.accentInk}`}>{tip.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{tip.durationHint}</span>
                  {tip.paliTerm && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="italic">{tip.paliTerm}</span>
                    </>
                  )}
                </div>

                <h3 className={`font-display text-2xl font-semibold leading-snug ${THEME_CLASSES.inkPrimary} text-balance`}>
                  {tip.title}
                </h3>

                <p className={`text-sm italic ${THEME_CLASSES.inkSecondary} leading-relaxed`}>
                  {tip.summary}
                </p>

                <ol className={`space-y-2.5 pt-2 border-t ${THEME_CLASSES.borderHairline} text-sm leading-[1.7] ${THEME_CLASSES.inkBody}`}>
                  {tip.guidance.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className={`font-mono-code text-xs ${THEME_CLASSES.accentInk} pt-1 tabular-nums`}>
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} flex flex-wrap items-center justify-between gap-3 text-xs ${THEME_CLASSES.inkSubtle}`}>
                <span>{tip.authorSayadaw}</span>

                {isOwner && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(tip)}
                      className="inline-flex items-center gap-1 hover:text-[var(--ink-primary)] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>

                    <ConfirmDeleteAction
                      isConfirming={confirmDeleteId === tip.id}
                      onRequestConfirm={() => setConfirmDeleteId(tip.id)}
                      onConfirm={() => {
                        onDeleteTip(tip.id);
                        setConfirmDeleteId(null);
                      }}
                      onCancel={() => setConfirmDeleteId(null)}
                      ariaLabel={`Delete ${tip.title}`}
                    />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {isOwner && (
        <EditorModal
          isOpen={isModalOpen}
          headingId="tip-modal-heading"
          kicker="Meditation Practice Guide"
          title={editingTip ? 'Edit Meditation Tip' : 'Add Meditation Tip'}
          error={formError}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmitTip} className="space-y-4">
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Tip Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Noting Physical Pain Without Reaction"
                className={THEME_CLASSES.input}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TipCategory)}
                  className={THEME_CLASSES.input}
                >
                  {TAXONOMY.tipCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Suggested Duration / Context</label>
                <input
                  type="text"
                  value={durationHint}
                  onChange={(e) => setDurationHint(e.target.value)}
                  placeholder="e.g., 30 min sitting"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Pāli Term (Optional)</label>
                <input
                  type="text"
                  value={paliTerm}
                  onChange={(e) => setPaliTerm(e.target.value)}
                  placeholder="e.g., Dukkha-vedanā · Khanti"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Teacher / Source</label>
                <input
                  type="text"
                  value={authorSayadaw}
                  onChange={(e) => setAuthorSayadaw(e.target.value)}
                  placeholder="e.g., Ven. Dr. Nandamālābhivaṃsa"
                  className={THEME_CLASSES.input}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>One-Sentence Summary</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Core principle of this meditation tip..."
                className={THEME_CLASSES.input}
              />
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>
                Step-by-Step Guidance * (One step per line)
              </label>
              <textarea
                rows={5}
                required
                value={guidanceText}
                onChange={(e) => setGuidanceText(e.target.value)}
                placeholder={
                  "Step 1: Notice the sensation directly as heat, tightness, or throbbing...\nStep 2: Observe without labelling it 'my pain'..."
                }
                className={THEME_CLASSES.textarea}
              />
            </div>

            <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} flex justify-end gap-3`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={THEME_CLASSES.btnSecondary}
              >
                Cancel
              </button>
              <button type="submit" className={THEME_CLASSES.btnAccent}>
                {editingTip ? 'Update Tip' : 'Save Tip'}
              </button>
            </div>
          </form>
        </EditorModal>
      )}
    </section>
  );
}
