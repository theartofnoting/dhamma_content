import { useState } from 'react';
import { Image as ImageIcon, Pencil, Plus, Trash2, X } from 'lucide-react';
import { DhammaDiscourse, SayadawProfile } from '../types/dhamma';
import { resolveAssetUrl } from '../utils/storageAndExport';
import { slugifySegment } from '../utils/urlRouter';

interface SayadawDirectoryProps {
  sayadaws: SayadawProfile[];
  discourses: DhammaDiscourse[];
  isOwner: boolean;
  onFilterBySayadaw: (sayadawId: string) => void;
  onSaveSayadaw: (sayadaw: SayadawProfile, isEdit: boolean) => void;
  onDeleteSayadaw: (sayadawId: string) => void;
}

export function SayadawDirectory({
  sayadaws,
  discourses,
  isOwner,
  onFilterBySayadaw,
  onSaveSayadaw,
  onDeleteSayadaw,
}: SayadawDirectoryProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSayadaw, setEditingSayadaw] = useState<SayadawProfile | null>(null);

  // Modal form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [honorificTitle, setHonorificTitle] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [years, setYears] = useState('');
  const [monastery, setMonastery] = useState('');
  const [location, setLocation] = useState('');
  const [lineage, setLineage] = useState('');
  const [biography, setBiography] = useState('');
  const [primaryTextsRaw, setPrimaryTextsRaw] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSayadaw(null);
    setName('');
    setSlug('');
    setHonorificTitle('Sayadaw');
    setChineseName('');
    setYears('');
    setMonastery('');
    setLocation('');
    setLineage('Vipassanā');
    setBiography('');
    setPrimaryTextsRaw('');
    setImageUrl('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: SayadawProfile) => {
    setEditingSayadaw(s);
    setName(s.name);
    setSlug(s.slug || s.id);
    setHonorificTitle(s.honorificTitle);
    setChineseName(s.chineseName || '');
    setYears(s.years);
    setMonastery(s.monastery);
    setLocation(s.location);
    setLineage(s.lineage);
    setBiography(s.biography);
    setPrimaryTextsRaw(s.primaryTexts.join('\n'));
    setImageUrl(s.imageUrl || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      setFormError('Portrait image exceeds 2 MB limit. Choose a smaller image or enter a URL.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Sayadaw name is required.');
      return;
    }
    const resolvedSlug = slugifySegment(slug.trim() || name.trim());
    const resolvedId = editingSayadaw ? editingSayadaw.id : resolvedSlug;
    const primaryTexts = primaryTextsRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload: SayadawProfile = {
      id: resolvedId,
      slug: resolvedSlug,
      name: name.trim(),
      honorificTitle: honorificTitle.trim() || 'Sayadaw',
      chineseName: chineseName.trim() || undefined,
      monastery: monastery.trim() || 'Vipassana Bhavana Archive',
      location: location.trim(),
      lineage: lineage.trim() || 'Vipassanā',
      years: years.trim(),
      biography: biography.trim() || `Teachings and discourses of ${name.trim()}.`,
      primaryTexts,
      imageUrl: imageUrl.trim() || undefined,
    };

    onSaveSayadaw(payload, Boolean(editingSayadaw));
    setIsModalOpen(false);
  };

  return (
    <section
      id="sayadaws-section"
      className="border-t border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16]"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E5DFD3] dark:border-[#342E28]">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
              02. Lineage &amp; Teachers
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] text-balance">
              Sayadaw Masters in the Archive
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
              Biographical notes, monastic seats, and core Pāli-Burmese lineages preserved by our
              Vipassana Bhavana group.
            </p>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Sayadaw</span>
            </button>
          )}
        </div>

        {sayadaws.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="font-display text-2xl font-medium text-[#1C1917] dark:text-[#F5F5F4]">
              No Sayadaw profiles added yet
            </p>
            {isOwner && (
              <button
                type="button"
                onClick={openCreateModal}
                className="min-h-[40px] px-4 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] cursor-pointer"
              >
                Add First Sayadaw
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E5DFD3] dark:divide-[#342E28]">
            {sayadaws.map((s) => {
              const count = discourses.filter((d) => d.sayadawId === s.id).length;
              const portraitSrc = s.imageUrl ? resolveAssetUrl(s.imageUrl) : '';
              return (
                <article
                  key={s.id}
                  className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  <div className="lg:col-span-4 flex items-start gap-4">
                    {portraitSrc && (
                      <img
                        src={portraitSrc}
                        alt={s.name}
                        className="h-16 w-16 shrink-0 object-cover border border-[#D6CEBE] dark:border-[#342E28]"
                      />
                    )}
                    <div className="space-y-1.5 min-w-0">
                      {(s.years || s.location) && (
                        <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
                          {[s.years, s.location].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                        {s.name}
                      </h3>
                      {s.chineseName && (
                        <p className="text-sm text-[#57534E] dark:text-[#D6D3D1]">
                          {s.chineseName}
                        </p>
                      )}
                      {s.honorificTitle && (
                        <p className="text-xs text-[#78716C] dark:text-[#A8A29E] pt-1">
                          {s.honorificTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    {(s.monastery || s.lineage) && (
                      <p className="text-xs uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                        {[s.monastery, s.lineage].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-sm leading-[1.7] text-[#44403C] dark:text-[#D6D3D1]">
                      {s.biography}
                    </p>
                  </div>

                  <div className="lg:col-span-3 flex flex-col justify-between gap-4 lg:items-end">
                    {s.primaryTexts.length > 0 && (
                      <div className="lg:text-right space-y-1">
                        <p className="text-xs uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                          Key Works
                        </p>
                        <ul className="text-xs text-[#44403C] dark:text-[#D6D3D1] space-y-1">
                          {s.primaryTexts.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap lg:justify-end items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onFilterBySayadaw(s.id)}
                        className="min-h-[40px] px-4 py-2 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] hover:text-[#9A3412] dark:hover:border-[#FDBA74] dark:hover:text-[#FDBA74] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span className="tabular-nums">View {count} Discourses</span>
                      </button>

                      {isOwner && (
                        <div className="flex items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            aria-label={`Edit ${s.name}`}
                            className="inline-flex items-center gap-1 min-h-[36px] px-2.5 border border-[#D6CEBE] dark:border-[#44403C] hover:border-[#9A3412] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </button>

                          {confirmDeleteId !== s.id ? (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(s.id)}
                              aria-label={`Delete ${s.name}`}
                              className="inline-flex items-center gap-1 min-h-[36px] px-2.5 border border-[#D6CEBE] dark:border-[#44403C] hover:border-[#9A3412] hover:text-[#9A3412] dark:hover:text-[#FCA5A5] cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteSayadaw(s.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="min-h-[36px] px-2.5 bg-[#9A3412] text-[#FBF9F5] font-medium cursor-pointer"
                              >
                                {count > 0 ? `Delete + ${count} talk(s)` : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Sayadaw Modal (Owner Only) */}
      {isOwner && isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sayadaw-modal-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FBF9F5] dark:bg-[#181512] border border-[#D6CEBE] dark:border-[#342E28] p-6 sm:p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFD3] dark:border-[#342E28]">
              <div>
                <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
                  Lineage &amp; Teachers
                </p>
                <h3
                  id="sayadaw-modal-heading"
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]"
                >
                  {editingSayadaw ? 'Edit Sayadaw Profile' : 'Add Sayadaw Profile'}
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

            <form onSubmit={handleSubmit} className="pt-5 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 border border-[#9A3412]/50 bg-[#9A3412]/5 text-xs text-[#9A3412] dark:text-[#FCA5A5]"
                >
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Sayadaw Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Ven. Mogok Sayadaw (U Vimala)"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Auto-generated (e.g. ven-mogok)"
                    className="w-full min-h-[42px] px-3 py-2 font-mono-code text-xs bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Honorific Title
                  </label>
                  <input
                    type="text"
                    value={honorificTitle}
                    onChange={(e) => setHonorificTitle(e.target.value)}
                    placeholder="e.g., Aggamahāpaṇḍita"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Chinese Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={chineseName}
                    onChange={(e) => setChineseName(e.target.value)}
                    placeholder="e.g., 莫哥薩亞多"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Monastery / Center
                  </label>
                  <input
                    type="text"
                    value={monastery}
                    onChange={(e) => setMonastery(e.target.value)}
                    placeholder="e.g., Mingala Taik Monastery"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Mogok & Mandalay, Myanmar"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Lineage / Tradition
                  </label>
                  <input
                    type="text"
                    value={lineage}
                    onChange={(e) => setLineage(e.target.value)}
                    placeholder="e.g., Paṭiccasamuppāda & Cittānupassanā"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Years
                  </label>
                  <input
                    type="text"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    placeholder="e.g., 1899–1962"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Portrait Image (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... or upload an image"
                      className="flex-1 min-h-[42px] px-3 py-2 font-mono-code text-xs bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                    />
                    <label className="inline-flex items-center gap-1.5 min-h-[42px] px-3.5 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] cursor-pointer shrink-0">
                      <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePortraitUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Biography
                </label>
                <textarea
                  rows={3}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Biographical summary and emphasis of teachings..."
                  className="w-full px-3 py-2 text-sm leading-relaxed bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Key Works (One per line, optional)
                </label>
                <textarea
                  rows={2}
                  value={primaryTextsRaw}
                  onChange={(e) => setPrimaryTextsRaw(e.target.value)}
                  placeholder="Dhamma Talks by Mogok Sayadaw"
                  className="w-full px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
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
                  {editingSayadaw ? 'Update Sayadaw' : 'Save Sayadaw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
