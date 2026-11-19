import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { createContext, useContext } from 'react';

export interface SortableItemContextValue {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
}

export const SortableItemContext = createContext<SortableItemContextValue | null>(null);

export function useSortableItemContext(): SortableItemContextValue {
  const context = useContext(SortableItemContext);
  if (!context) throw new Error('DragHandle must be rendered inside a SortableItem');
  return context;
}
