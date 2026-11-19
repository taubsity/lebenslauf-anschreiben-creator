import type { Announcements, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  className?: string;
  children: (item: T) => ReactNode;
}

const MODIFIERS = [restrictToVerticalAxis, restrictToParentElement];

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  className,
  children,
}: SortableListProps<T>) {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  const accessibility = useMemo(() => {
    const position = (id: UniqueIdentifier) => ({
      position: ids.indexOf(String(id)) + 1,
      total: ids.length,
    });
    const announcements: Announcements = {
      onDragStart: ({ active }) => t('dnd.picked', position(active.id)),
      onDragOver: ({ over }) => (over ? t('dnd.movedOver', position(over.id)) : undefined),
      onDragEnd: ({ over }) => (over ? t('dnd.dropped', position(over.id)) : undefined),
      onDragCancel: ({ active }) => t('dnd.cancelled', position(active.id)),
    };
    return { announcements, screenReaderInstructions: { draggable: t('dnd.instructions') } };
  }, [ids, t]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(items, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={MODIFIERS}
      accessibility={accessibility}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={className}>{items.map((item) => children(item))}</div>
      </SortableContext>
    </DndContext>
  );
}
