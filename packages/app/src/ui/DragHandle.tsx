import { useTranslation } from 'react-i18next';
import { useSortableItemContext } from './sortableItemContext.js';

interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className = '' }: DragHandleProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setActivatorNodeRef } = useSortableItemContext();

  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
      }}
      aria-label={t('actions.dragToReorder')}
      title={t('actions.dragToReorder')}
      className={`shrink-0 cursor-grab touch-none rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <circle cx="5" cy="3" r="1.1" />
        <circle cx="9" cy="3" r="1.1" />
        <circle cx="5" cy="7" r="1.1" />
        <circle cx="9" cy="7" r="1.1" />
        <circle cx="5" cy="11" r="1.1" />
        <circle cx="9" cy="11" r="1.1" />
      </svg>
    </button>
  );
}
