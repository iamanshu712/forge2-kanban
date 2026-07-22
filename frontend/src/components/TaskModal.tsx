import React, { useState } from 'react';
import type { Task, TaskFormData } from '../types';
import { tasksApi } from '../api/tasks';

interface Props {
  task: Task | null;
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onDeleted: (id: number) => void;
}

const PRIORITY_COLORS = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function TaskModal({ task, onClose, onUpdated, onDeleted }: Props) {
  const [form, setForm] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    due_date: task?.due_date || '',
    priority: task?.priority || undefined,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const { data } = await tasksApi.update(task.id, form);
      onUpdated(data);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tasksApi.delete(task.id);
      onDeleted(task.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-kanban-surface border border-kanban-border rounded-2xl w-full max-w-lg shadow-modal animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kanban-border">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-kanban-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-kanban-muted text-sm">Task Details</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-kanban-muted hover:text-white hover:bg-kanban-card transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-kanban-muted uppercase tracking-wide mb-2">Title</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-kanban-card border border-kanban-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-kanban-accent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-kanban-muted uppercase tracking-wide mb-2">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              placeholder="Add a description..."
              className="w-full bg-kanban-card border border-kanban-border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-kanban-muted focus:outline-none focus:ring-2 focus:ring-kanban-accent transition resize-none"
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-kanban-muted uppercase tracking-wide mb-2">Priority</label>
              <select
                value={form.priority || ''}
                onChange={(e) => setForm((f) => ({ ...f, priority: (e.target.value as Task['priority']) || undefined }))}
                className="w-full bg-kanban-card border border-kanban-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-kanban-accent transition"
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-kanban-muted uppercase tracking-wide mb-2">Due Date</label>
              <input
                type="date"
                value={form.due_date || ''}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value || undefined }))}
                className="w-full bg-kanban-card border border-kanban-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-kanban-accent transition [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Priority Badge Preview */}
          {form.priority && (
            <div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${PRIORITY_COLORS[form.priority]}`}>
                {form.priority.charAt(0).toUpperCase() + form.priority.slice(1)} Priority
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-kanban-border">
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-400">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-kanban-muted hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 text-kanban-muted hover:text-red-400 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete task
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-kanban-border text-kanban-muted hover:text-white hover:border-kanban-accent rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="px-5 py-2 bg-kanban-accent hover:bg-kanban-accent-hover text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
