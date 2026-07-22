import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column, Task } from '../types';
import TaskCard from './TaskCard';
import { tasksApi } from '../api/tasks';
import { columnsApi } from '../api/columns';

interface Props {
  column: Column;
  onTaskOpen: (task: Task) => void;
  onTaskCreated: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
  onColumnUpdated: (column: Column) => void;
  onColumnDeleted: (id: number) => void;
}

export default function KanbanColumn({
  column,
  onTaskOpen,
  onTaskCreated,
  onColumnUpdated,
  onColumnDeleted,
}: Props) {
  const tasks = column.tasks || [];

  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [colName, setColName] = useState(column.name);
  const [savingName, setSavingName] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col-${column.id}`, data: { type: 'column', column } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setCreating(true);
    try {
      const { data } = await tasksApi.create(column.id, { title: newTaskTitle.trim() });
      onTaskCreated(data);
      setNewTaskTitle('');
      setAddingTask(false);
    } finally {
      setCreating(false);
    }
  };

  const handleRenameColumn = async () => {
    if (!colName.trim() || colName === column.name) {
      setColName(column.name);
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const { data } = await columnsApi.update(column.id, { name: colName.trim() });
      onColumnUpdated(data);
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteColumn = async () => {
    await columnsApi.delete(column.id);
    onColumnDeleted(column.id);
  };

  const taskIds = tasks.map((t) => `task-${t.id}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border transition-all ${
        isDragging ? 'border-kanban-accent shadow-card-hover' : 'border-kanban-border'
      } bg-kanban-surface`}
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-4 py-3 border-b border-kanban-border cursor-grab active:cursor-grabbing"
      >
        {editingName ? (
          <input
            autoFocus
            value={colName}
            onChange={(e) => setColName(e.target.value)}
            onBlur={handleRenameColumn}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameColumn();
              if (e.key === 'Escape') { setColName(column.name); setEditingName(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={savingName}
            className="flex-1 bg-kanban-card border border-kanban-accent rounded-lg px-2 py-1 text-white text-sm font-semibold focus:outline-none"
          />
        ) : (
          <h3
            className="flex-1 text-white font-semibold text-sm truncate cursor-pointer hover:text-kanban-accent transition-colors"
            onDoubleClick={(e) => { e.stopPropagation(); setEditingName(true); }}
          >
            {column.name}
          </h3>
        )}

        <span className="bg-kanban-card text-kanban-muted text-xs font-medium rounded-full px-2 py-0.5 min-w-[24px] text-center">
          {tasks.length}
        </span>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu((m) => !m); }}
            className="w-6 h-6 flex items-center justify-center rounded text-kanban-muted hover:text-white hover:bg-kanban-card transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-8 z-20 bg-kanban-card border border-kanban-border rounded-xl shadow-modal min-w-[140px] py-1 animate-slide-in"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                className="w-full text-left px-4 py-2 text-sm text-kanban-text hover:bg-kanban-surface hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); setEditingName(true); setShowMenu(false); }}
              >
                Rename
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); setShowMenu(false); }}
              >
                Delete column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-260px)]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 && !addingTask && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-kanban-card rounded-xl flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-kanban-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-kanban-muted text-xs">No tasks yet</p>
            </div>
          )}
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onTaskOpen} />
          ))}
        </SortableContext>

        {/* Add Task Form */}
        {addingTask && (
          <form onSubmit={handleCreateTask} className="space-y-2 animate-slide-in">
            <textarea
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateTask(e as unknown as React.FormEvent); }
                if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle(''); }
              }}
              placeholder="Task title..."
              rows={2}
              className="w-full bg-kanban-card border border-kanban-accent rounded-xl px-3 py-2 text-white text-sm placeholder:text-kanban-muted focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !newTaskTitle.trim()}
                className="flex-1 bg-kanban-accent hover:bg-kanban-accent-hover text-white text-xs font-medium py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? 'Adding...' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => { setAddingTask(false); setNewTaskTitle(''); }}
                className="px-3 py-1.5 text-kanban-muted hover:text-white text-xs rounded-lg hover:bg-kanban-card transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Add Task Button */}
      {!addingTask && (
        <div className="p-3 pt-1 border-t border-kanban-border">
          <button
            onClick={() => setAddingTask(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-kanban-muted hover:text-white hover:bg-kanban-card rounded-xl text-sm transition-all group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a task
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(false)}>
          <div className="bg-kanban-surface border border-kanban-border rounded-2xl p-6 w-full max-w-sm shadow-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-2">Delete Column?</h3>
            <p className="text-kanban-muted text-sm mb-6">
              All <strong className="text-white">{tasks.length}</strong> tasks in &quot;{column.name}&quot; will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-kanban-border text-kanban-muted hover:text-white transition-all text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleDeleteColumn} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
