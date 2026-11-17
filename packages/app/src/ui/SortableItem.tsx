import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import { SortableItemContext } from './sortableItemContext.js';

interface SortableItemProps {
  id: string;
  className?: string;
  children: ReactNode;
}

export function SortableItem({ id, className = '', children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const context = useMemo(
    () => ({ attributes, listeners, setActivatorNodeRef }),
    [attributes, listeners, setActivatorNodeRef],
  );

  return (
    <SortableItemContext.Provider value={context}>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={`${className} ${isDragging ? 'relative z-10 rounded-md bg-white shadow-lg ring-1 ring-slate-200' : ''}`}
      >
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}
