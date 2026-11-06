import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { moveItem } from '../../services/util';
import { cx } from '../ui';

export interface SortableListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  selectedKey?: string;
  onSelect?: (item: T) => void;
  ariaLabel: string;
}

/**
 * Vertical list reorderable by native HTML5 drag-and-drop and, for keyboard
 * and assistive-technology users, by explicit up/down buttons. Moves are
 * announced through a polite live region.
 */
export function SortableList<T>({ items, getKey, getLabel, onReorder, renderItem, selectedKey, onSelect, ariaLabel }: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    onReorder(moveItem(items, from, to));
    setAnnouncement(`${getLabel(items[from])} moved to position ${to + 1} of ${items.length}.`);
  };

  return (
    <>
      <ul aria-label={ariaLabel} className="divide-y divide-zinc-100">
        {items.map((item, i) => {
          const key = getKey(item);
          const selected = key === selectedKey;
          return (
            <li
              key={key}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', key);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (overIndex !== i) setOverIndex(i);
              }}
              onDragLeave={() => setOverIndex((o) => (o === i ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cx(
                'group relative flex items-center gap-1 pr-2 transition-colors',
                selected ? 'bg-zinc-50' : 'bg-white hover:bg-zinc-50/70',
                dragIndex === i && 'opacity-40',
                overIndex === i && dragIndex !== null && dragIndex !== i && (dragIndex < i ? 'shadow-[inset_0_-2px_0_#0f766e]' : 'shadow-[inset_0_2px_0_#0f766e]'),
              )}
            >
              {selected && <span className="absolute inset-y-0 left-0 w-0.5 bg-zinc-900" aria-hidden="true" />}
              <span className="flex h-full cursor-grab items-center pl-2 text-zinc-300 active:cursor-grabbing group-hover:text-zinc-500" aria-hidden="true">
                <GripVertical size={14} />
              </span>
              <button type="button" onClick={() => onSelect?.(item)} aria-current={selected || undefined} className="min-w-0 flex-1 py-2.5 pl-1 text-left">
                {renderItem(item, i)}
              </button>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Move ${getLabel(item)} up`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-900 disabled:opacity-25"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Move ${getLabel(item)} down`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-900 disabled:opacity-25"
                >
                  <ArrowDown size={13} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
