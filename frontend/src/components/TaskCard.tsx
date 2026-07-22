import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';

interface Props {
  task: Task;
  onOpen: (task: Task) => void;
}

const PRIORITY_BADGES = {
  low: { label: 'Low', cls: 'bg-green-500/20 text-green-400' },
  medium: { label: 'Medium', cls: 'bg-yellow-500/20 text-yellow-400' },
  high: { label: 'High', cls: 'bg-red-500/20 text-red-400' },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function isOverdue(iso: string) {
  return new Date(iso) < new Date(new Date().toDateString());
}

export default function TaskCard({ task, onOpen }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `task-${task.id}`, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen(task)}
      className={`
        group bg-kanban-card border rounded-xl p-3.5 cursor-pointer
        transition-all duration-200 select-none
        ${isDragging
          ? 'border-kanban-accent shadow-card-hover rotate-2'
          : isHovered
          ? 'border-kanban-accent/50 shadow-card-hover -translate-y-0.5'
          : 'border-kanban-border shadow-card'
        }
      `}
    >
      {/* Priority badge */}
      {task.priority && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${PRIORITY_BADGES[task.priority].cls}`}>
          {PRIORITY_BADGES[task.priority].label}
        </span>
      )}

      {/* Title */}
      <p className="text-white text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

      {/* Description preview */}
      {task.description && (
        <p className="text-kanban-muted text-xs mt-1.5 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-3">
        {task.due_date && (
          <span className={`flex items-center gap-1 text-xs ${isOverdue(task.due_date) ? 'text-red-400' : 'text-kanban-muted'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(task.due_date)}
          </span>
        )}
        <div className="flex-1" />
        <span className={`w-5 h-5 flex items-center justify-center rounded text-kanban-muted transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </span>
      </div>
    </div>
  );
}
