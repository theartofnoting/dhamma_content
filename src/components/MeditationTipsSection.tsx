import { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { MeditationTip, TipCategory } from '../types/dhamma';

interface MeditationTipsSectionProps {
  tips: MeditationTip[];
  onSaveTip: (tip: MeditationTip, isEdit: boolean) => void;
  onDeleteTip: (id: string) => void;
}

const TIP_CATEGORIES: (TipCategory | 'All')[] = [
  'All',
  'Breath & Anchor',
  'Posture & Walking',
  'Working with Hindrances',
  'Daily Mindfulness',
];

export function MeditationTipsSection({
  tips,
  onSaveTip,
  onDeleteTip,
}: MeditationTipsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<TipCategory | 'All'>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<MeditationTip | null>(null);

  // Modal fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TipCategory>('Breath & Anchor');
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
    setCategory('Breath & Anchor');
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
      authorSayadaw: authorSayadaw.trim() || 'Vipassana Bhavana Guidance',
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
      className="border-t border-[#E5DFD3] dark:border-[#342E28] mx-auto max-w-[1200px] px-4 py-14 sm:px-8 sm:py-16"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5DFD3] dark:border-[#342E28]">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
            03. Practice Guidance
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] text-balance">
            Meditation Tips &amp; Sitting Notes
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
            Practical instructions from our Sayadaw lineage for sitting, walking, and meeting
            distractions with steady awareness.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Meditation Tip</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter meditation tips by category"
        className="flex items-center gap-1.5 overflow-x-auto py-5 border-b border-[#E5DFD3] dark:border-[#342E28]"
      >
        {TIP_CATEGORIES.map((cat) => {
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
                  ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                  : 'bg-[#F4EFE6] text-[#57534E] hover:text-[#1C1917] dark:bg-[#25211D] dark:text-[#A8A29E] dark:hover:text-[#F5F5F4]'
              }`}
            >
              {cat === 'All' ? 'All Practice Areas' : cat}
            </button>
          );
        })}
      </div>

      {filteredTips.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className="font-display text-2xl font-medium text-[#1C1917] dark:text-[#F5F5F4]">
            No meditation tips in this category yet
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[40px] px-4 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] cursor-pointer"
          >
            Add First Tip
          </button>
        </div>
      ) : (
        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredTips.map((tip) => (
            <article
              key={tip.id}
              className="p-6 border border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/35 dark:bg-[#1E1A16] flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
                  <span className="font-medium text-[#9A3412] dark:text-[#FDBA74]">
                    {tip.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{tip.durationHint}</span>
                  {tip.paliTerm && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="italic">{tip.paliTerm}</span>
                    </>
                  )}
                </div>

                <h3 className="font-display text-2xl font-semibold leading-snug text-[#1C1917] dark:text-[#F5F5F4] text-balance">
                  {tip.title}
                </h3>

                <p className="text-sm italic text-[#57534E] dark:text-[#D6D3D1] leading-relaxed">
                  {tip.summary}
                </p>

                <ol className="space-y-2.5 pt-2 border-t border-[#E5DFD3]/80 dark:border-[#342E28]/80 text-sm leading-[1.7] text-[#292524] dark:text-[#E7E5E4]">
                  {tip.guidance.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74] pt-1 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 border-t border-[#E5DFD3] dark:border-[#342E28] flex flex-wrap items-center justify-between gap-3 text-xs text-[#78716C] dark:text-[#A8A29E]">
                <span>{tip.authorSayadaw}</span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(tip)}
                    className="inline-flex items-center gap-1 hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Edit</span>
                  </button>

                  {confirmDeleteId !== tip.id ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(tip.id)}
                      className="inline-flex items-center gap-1 hover:text-[#9A3412] dark:hover:text-[#FCA5A5] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTip(tip.id);
                          setConfirmDeleteId(null);
                        }}
                        className="text-[#9A3412] dark:text-[#FCA5A5] font-medium underline cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* In-app Meditation Tip Editor Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tip-modal-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FBF9F5] dark:bg-[#181512] border border-[#D6CEBE] dark:border-[#342E28] p-6 sm:p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFD3] dark:border-[#342E28]">
              <div>
                <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
                  Meditation Practice Guide
                </p>
                <h3
                  id="tip-modal-heading"
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]"
                >
                  {editingTip ? 'Edit Meditation Tip' : 'Add Meditation Tip'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTip} className="pt-5 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 border border-[#9A3412]/50 bg-[#9A3412]/5 text-xs text-[#9A3412] dark:text-[#FCA5A5]"
                >
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Tip Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Noting Physical Pain Without Reaction"
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TipCategory)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  >
                    {TIP_CATEGORIES.filter((c): c is TipCategory => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Suggested Duration / Context
                  </label>
                  <input
                    type="text"
                    value={durationHint}
                    onChange={(e) => setDurationHint(e.target.value)}
                    placeholder="e.g., 30 min sitting"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Pāli Term (Optional)
                  </label>
                  <input
                    type="text"
                    value={paliTerm}
                    onChange={(e) => setPaliTerm(e.target.value)}
                    placeholder="e.g., Dukkha-vedanā · Khanti"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Teacher / Source
                  </label>
                  <input
                    type="text"
                    value={authorSayadaw}
                    onChange={(e) => setAuthorSayadaw(e.target.value)}
                    placeholder="e.g., Ven. Dr. Nandamālābhivaṃsa"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  One-Sentence Summary
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Core principle of this meditation tip..."
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Step-by-Step Guidance * (One step per line)
                </label>
                <textarea
                  rows={5}
                  required
                  value={guidanceText}
                  onChange={(e) => setGuidanceText(e.target.value)}
                  placeholder="Step 1: Notice the sensation directly as heat, tightness, or throbbing...&#10;Step 2: Observe without labelling it 'my pain'..."
                  className="w-full px-3 py-2 text-sm leading-relaxed bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5DFD3] dark:border-[#342E28] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] cursor-pointer"
                >
                  {editingTip ? 'Update Tip' : 'Save Tip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
