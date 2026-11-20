import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { SECTION_IDS, TAXONOMY } from '../config/siteConfig';
import { LocaleDictionary } from '../i18n';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { EditorModal } from '../theme/components/EditorModal';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { MeditationTip, TipCategory } from '../types/dhamma';

interface MeditationTipsSectionProps {
  dict: LocaleDictionary;
  tips: MeditationTip[];
  isOwner: boolean;
  onSaveTip: (tip: MeditationTip, isEdit: boolean) => void;
  onDeleteTip: (id: string) => void;
}

const TIP_FILTER_OPTIONS: (TipCategory | 'All')[] = ['All', ...TAXONOMY.tipCategories];

export function MeditationTipsSection({
  dict,
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
  const [durationHint, setDurationHint] = useState('15–30 min');
  const [authorSayadaw, setAuthorSayadaw] = useState('Group Practice Tradition');
  const [summary, setSummary] = useState('');
  const [guidanceRaw, setGuidanceRaw] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredTips =
    selectedCategory === 'All'
      ? tips
      : tips.filter((t) => t.category === selectedCategory);

  const openCreate = () => {
    setEditingTip(null);
    setTitle('');
    setCategory(TAXONOMY.tipCategories[0]);
    setPaliTerm('');
    setDurationHint('15–30 min');
    setAuthorSayadaw('Group Practice Tradition');
    setSummary('');
    setGuidanceRaw('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (tip: MeditationTip) => {
    setEditingTip(tip);
    setTitle(tip.title);
    setCategory(tip.category);
    setPaliTerm(tip.paliTerm || '');
    setDurationHint(tip.durationHint);
    setAuthorSayadaw(tip.authorSayadaw);
    setSummary(tip.summary);
    setGuidanceRaw(tip.guidance.join('\n'));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setFormError('Title and summary are required.');
      return;
    }

    const guidance = guidanceRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload: MeditationTip = {
      id: editingTip ? editingTip.id : `tip-${Date.now()}`,
      title: title.trim(),
      category,
      paliTerm: paliTerm.trim() || undefined,
      durationHint: durationHint.trim() || '15–30 min',
      authorSayadaw: authorSayadaw.trim() || 'Vipassana Bhavana',
      summary: summary.trim(),
      guidance,
      updatedAt: new Date().toISOString().slice(0, 10),
      isUserCreated: true,
    };

    onSaveTip(payload, Boolean(editingTip));
    setIsModalOpen(false);
  };

  return (
    <section id={SECTION_IDS.tips} className={THEME_CLASSES.sectionContainer}>
      <SectionHeader
        kicker={dict.tips.kicker}
        title={dict.tips.title}
        description={dict.tips.description}
        actions={
          isOwner ? (
            <button type="button" onClick={openCreate} className={THEME_CLASSES.btnAccent}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{dict.tips.addTip}</span>
            </button>
          ) : undefined
        }
      />

      <div className="py-5 flex flex-wrap items-center gap-2">
        {TIP_FILTER_OPTIONS.map((cat) => {
          const isActive = selectedCategory === cat;
          const label =
            cat === 'All' ? dict.tips.allCategories : dict.taxonomyLabels.tipCategories[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)] border-[var(--ink-primary)]'
                  : `${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)]`
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filteredTips.length === 0 ? (
        <p className={`py-12 text-center text-sm ${THEME_CLASSES.inkMuted} border-t ${THEME_CLASSES.borderHairline}`}>
          {dict.tips.emptyText}
        </p>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t ${THEME_CLASSES.borderHairline}`}>
          {filteredTips.map((tip) => (
            <article key={tip.id} className={`p-6 ${THEME_CLASSES.card} flex flex-col justify-between gap-4`}>
              <div className="space-y-3">
                <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkMuted}`}>
                  <span className={THEME_CLASSES.accentInk}>
                    {dict.taxonomyLabels.tipCategories[tip.category]}
                  </span>
                  {tip.paliTerm && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="italic">{tip.paliTerm}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{tip.durationHint}</span>
                </div>

                <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                  {tip.title}
                </h3>

                <p className={`text-sm leading-relaxed ${THEME_CLASSES.inkSecondary}`}>
                  {tip.summary}
                </p>

                {tip.guidance.length > 0 && (
                  <ol className={`space-y-1.5 text-xs leading-relaxed ${THEME_CLASSES.inkMuted} list-decimal pl-4`}>
                    {tip.guidance.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>

              <div className={`pt-3 border-t ${THEME_CLASSES.borderHairline} flex items-center justify-between gap-3 text-xs ${THEME_CLASSES.inkSubtle}`}>
                <span>
                  {tip.authorSayadaw} · {tip.updatedAt}
                </span>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(tip)}
                      className={`inline-flex items-center gap-1 hover:text-[var(--ink-primary)] cursor-pointer`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{dict.sayadaws.edit}</span>
                    </button>
                    <ConfirmDeleteAction
                      isConfirming={confirmDeleteId === tip.id}
                      onRequestConfirm={() => setConfirmDeleteId(tip.id)}
                      onConfirm={() => {
                        onDeleteTip(tip.id);
                        setConfirmDeleteId(null);
                      }}
                      onCancel={() => setConfirmDeleteId(null)}
                      confirmLabel={dict.catalog.confirmDelete}
                      cancelLabel={dict.sayadaws.cancelBtn}
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
          kicker={dict.tips.modalKicker}
          title={editingTip ? dict.tips.editTitle : dict.tips.createTitle}
          error={formError}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TipCategory)}
                  className={THEME_CLASSES.input}
                >
                  {TAXONOMY.tipCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Pāli Term (Optional)</label>
                <input
                  type="text"
                  value={paliTerm}
                  onChange={(e) => setPaliTerm(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Duration Hint</label>
                <input
                  type="text"
                  value={durationHint}
                  onChange={(e) => setDurationHint(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className={THEME_CLASSES.label}>Teacher / Tradition</label>
                <input
                  type="text"
                  value={authorSayadaw}
                  onChange={(e) => setAuthorSayadaw(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Summary *</label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={THEME_CLASSES.textarea}
              />
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Step-by-Step Guidance (One step per line)</label>
              <textarea
                rows={4}
                value={guidanceRaw}
                onChange={(e) => setGuidanceRaw(e.target.value)}
                className={THEME_CLASSES.textarea}
              />
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
                {editingTip ? 'Update Tip' : 'Save Tip'}
              </button>
            </div>
          </form>
        </EditorModal>
      )}
    </section>
  );
}
