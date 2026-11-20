import { Bookmark, Clock, Download, Headphones, Pencil } from 'lucide-react';
import { LocaleDictionary } from '../../i18n';
import { ConfirmDeleteAction } from '../../theme/components/ConfirmDeleteAction';
import { THEME_CLASSES } from '../../theme/uiClasses';
import { DhammaDiscourse } from '../../types/dhamma';

interface CatalogueRowProps {
  dict: LocaleDictionary;
  discourse: DhammaDiscourse;
  estMinutes: number;
  isSaved: boolean;
  isOwner: boolean;
  isConfirmingDelete: boolean;
  showSayadawColumn: boolean;
  onSelectDiscourse: (id: string) => void;
  onSayadawChange: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onExportMarkdown: (d: DhammaDiscourse) => void;
  onEditDiscourse: (d: DhammaDiscourse) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

export function CatalogueRow({
  dict,
  discourse: d,
  estMinutes,
  isSaved,
  isOwner,
  isConfirmingDelete,
  showSayadawColumn,
  onSelectDiscourse,
  onSayadawChange,
  onToggleBookmark,
  onExportMarkdown,
  onEditDiscourse,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: CatalogueRowProps) {
  const hasMedia = Boolean(d.audioReferenceUrl || (d.mediaItems && d.mediaItems.length > 0));

  return (
    <div
      className={`${showSayadawColumn ? 'py-5' : 'py-4'} grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-center hover:bg-[var(--surface-band)] transition-colors px-2 -mx-2`}
    >
      <div className="lg:col-span-2 flex items-center gap-2">
        <span className={`font-mono-code text-xs ${THEME_CLASSES.accentInk} tabular-nums`}>
          {d.accessionCode}
        </span>
      </div>

      <div className={`${showSayadawColumn ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-1`}>
        <button
          type="button"
          onClick={() => onSelectDiscourse(d.id)}
          className={`text-left font-display text-xl font-semibold ${THEME_CLASSES.inkPrimary} hover:text-[var(--accent-ink)] transition-colors cursor-pointer`}
        >
          {d.title}
        </button>
        <div className={`flex flex-wrap items-center gap-2 text-xs ${THEME_CLASSES.inkMuted}`}>
          {d.vietnameseTitle && <span>{d.vietnameseTitle}</span>}
          {d.vietnameseTitle && <span aria-hidden="true">·</span>}
          <span>{dict.taxonomyLabels.collections[d.collection]}</span>
          <span aria-hidden="true">·</span>
          <span>{d.language}</span>
          {hasMedia && (
            <>
              <span aria-hidden="true">·</span>
              <span className={`inline-flex items-center gap-1 ${THEME_CLASSES.accentInk}`}>
                <Headphones className="h-3 w-3" aria-hidden="true" />
                <span>Media</span>
              </span>
            </>
          )}
        </div>
      </div>

      {showSayadawColumn && (
        <div className="lg:col-span-3 space-y-0.5 text-sm">
          <button
            type="button"
            onClick={() => onSayadawChange(d.sayadawId)}
            className={`font-medium ${THEME_CLASSES.inkBody} hover:text-[var(--accent-ink)] hover:underline underline-offset-4 cursor-pointer text-left`}
          >
            {d.sayadawName}
          </button>
          <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>{d.sourceText}</p>
        </div>
      )}

      <div
        className={`${showSayadawColumn ? 'lg:col-span-3' : 'lg:col-span-5'} flex items-center lg:justify-end gap-2 flex-wrap`}
      >
        <span
          className={`inline-flex items-center gap-1 text-xs ${THEME_CLASSES.inkSubtle} tabular-nums mr-1`}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {estMinutes}m
        </span>
        <button
          type="button"
          onClick={() => onSelectDiscourse(d.id)}
          className={`min-h-[36px] px-3 py-1.5 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)] cursor-pointer`}
        >
          {dict.catalog.readDiscourse}
        </button>
        <button
          type="button"
          onClick={() => onToggleBookmark(d.id)}
          aria-label={isSaved ? dict.catalog.saved : dict.catalog.save}
          className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center border cursor-pointer ${
            isSaved
              ? 'border-[var(--accent-primary)] text-[var(--accent-ink)]'
              : `${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)]`
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onExportMarkdown(d)}
          aria-label={`${dict.catalog.exportMd} ${d.title}`}
          className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => onEditDiscourse(d)}
              aria-label={`${dict.catalog.edit} ${d.title}`}
              className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <ConfirmDeleteAction
              isConfirming={isConfirmingDelete}
              onRequestConfirm={() => onRequestDelete(d.id)}
              onConfirm={() => onConfirmDelete(d.id)}
              onCancel={onCancelDelete}
              ariaLabel={`${dict.catalog.confirmDelete} ${d.title}`}
              confirmLabel={dict.catalog.confirmDelete}
              cancelLabel={dict.sayadaws.cancelBtn}
              variant="icon"
            />
          </>
        )}
      </div>
    </div>
  );
}
