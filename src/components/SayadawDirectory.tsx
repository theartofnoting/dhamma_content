import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { SECTION_IDS } from '../config/siteConfig';
import { LocaleDictionary } from '../i18n';
import { resolveAssetUrl } from '../plugins/mediaResolver';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { DhammaDiscourse, SayadawProfile } from '../types/dhamma';
import { SayadawEditorModal } from './sayadaw/SayadawEditorModal';

interface SayadawDirectoryProps {
  dict: LocaleDictionary;
  sayadaws: SayadawProfile[];
  discourses: DhammaDiscourse[];
  isOwner: boolean;
  onFilterBySayadaw: (sayadawId: string) => void;
  onSaveSayadaw: (sayadaw: SayadawProfile, isEdit: boolean) => void;
  onDeleteSayadaw: (sayadawId: string) => void;
}

export function SayadawDirectory({
  dict,
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

  const openCreateModal = () => {
    setEditingSayadaw(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: SayadawProfile) => {
    setEditingSayadaw(s);
    setIsModalOpen(true);
  };

  return (
    <section id={SECTION_IDS.sayadaws} className={THEME_CLASSES.band}>
      <div className={THEME_CLASSES.sectionContainer}>
        <SectionHeader
          kicker={dict.sayadaws.kicker}
          title={dict.sayadaws.title}
          description={dict.sayadaws.description}
          actions={
            isOwner ? (
              <button type="button" onClick={openCreateModal} className={THEME_CLASSES.btnAccent}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{dict.sayadaws.addSayadaw}</span>
              </button>
            ) : undefined
          }
        />

        {sayadaws.length === 0 ? (
          <p className={`py-12 text-center text-sm ${THEME_CLASSES.inkMuted}`}>
            {dict.sayadaws.emptyText}
          </p>
        ) : (
          <div className={THEME_CLASSES.divideHairline}>
            {sayadaws.map((s) => {
              const count = discourses.filter((d) => d.sayadawId === s.id).length;
              return (
                <article
                  key={s.id}
                  className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  <div className="lg:col-span-5 flex items-start gap-4">
                    {s.imageUrl && (
                      <img
                        src={resolveAssetUrl(s.imageUrl)}
                        alt={s.name}
                        referrerPolicy="no-referrer"
                        className={`h-16 w-16 object-cover border ${THEME_CLASSES.borderStrong} shrink-0`}
                      />
                    )}
                    <div className="space-y-1.5">
                      <p className={`text-xs ${THEME_CLASSES.inkSubtle}`}>
                        {s.honorificTitle}
                        {s.years ? ` · ${s.years}` : ''}
                      </p>
                      <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                        {s.name}
                      </h3>
                      {s.vietnameseName && (
                        <p className={`text-sm font-medium ${THEME_CLASSES.inkSecondary}`}>
                          {s.vietnameseName}
                        </p>
                      )}
                      <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>
                        {s.monastery}
                        {s.location ? ` · ${s.location}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-2">
                    <p className={`text-xs font-medium ${THEME_CLASSES.accentInk}`}>{s.lineage}</p>
                    <p className={`text-sm leading-relaxed ${THEME_CLASSES.inkSecondary}`}>
                      {s.biography}
                    </p>
                    {s.primaryTexts.length > 0 && (
                      <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>
                        {s.primaryTexts.join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-3 flex flex-col lg:items-end gap-3">
                    <div className="flex flex-wrap lg:justify-end items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onFilterBySayadaw(s.id)}
                        className={`${THEME_CLASSES.btnOutline} hover:text-[var(--accent-ink)]`}
                      >
                        <span className="tabular-nums">
                          {dict.sayadaws.viewDiscoursesPrefix} {count}{' '}
                          {dict.sayadaws.viewDiscoursesSuffix}
                        </span>
                      </button>

                      {isOwner && (
                        <div className={`flex items-center gap-2 text-xs ${THEME_CLASSES.inkMuted}`}>
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            aria-label={`${dict.sayadaws.edit} ${s.name}`}
                            className={`inline-flex items-center gap-1 min-h-[36px] px-2.5 border ${THEME_CLASSES.borderStrong} hover:border-[var(--accent-ink)] hover:text-[var(--ink-primary)] cursor-pointer`}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{dict.sayadaws.edit}</span>
                          </button>

                          <ConfirmDeleteAction
                            isConfirming={confirmDeleteId === s.id}
                            onRequestConfirm={() => setConfirmDeleteId(s.id)}
                            onConfirm={() => {
                              onDeleteSayadaw(s.id);
                              setConfirmDeleteId(null);
                            }}
                            onCancel={() => setConfirmDeleteId(null)}
                            ariaLabel={`Delete ${s.name}`}
                            confirmLabel={
                              count > 0
                                ? `${dict.catalog.confirmDelete} (+${count} ${dict.sayadaws.deleteWithTalksSuffix})`
                                : dict.catalog.confirmDelete
                            }
                            cancelLabel={dict.sayadaws.cancelBtn}
                            variant="button"
                          />
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

      {isOwner && (
        <SayadawEditorModal
          isOpen={isModalOpen}
          dict={dict}
          editingSayadaw={editingSayadaw}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveSayadaw}
        />
      )}
    </section>
  );
}
