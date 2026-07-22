import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Board, BoardFormData } from '../types';
import { boardsApi } from '../api/boards';

interface Props {
  boards: Board[];
  loading: boolean;
  onBoardCreated: (board: Board) => void;
  onBoardDeleted: (id: number) => void;
}

const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];

export default function Sidebar({ boards, loading, onBoardCreated, onBoardDeleted }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BoardFormData>({ name: '', description: '', color: BOARD_COLORS[0] });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const { data } = await boardsApi.create(form);
      onBoardCreated(data);
      setForm({ name: '', description: '', color: BOARD_COLORS[0] });
      setShowCreate(false);
      navigate(`/boards/${data.id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDelete = async (id: number) => {
    await boardsApi.delete(id);
    onBoardDeleted(id);
    setDeleteId(null);
    if (boardId === String(id)) navigate('/boards');
  };

  return (
    <aside className="w-64 min-h-screen bg-kanban-surface border-r border-kanban-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-kanban-border">
        <Link to="/boards" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-kanban-accent rounded-xl flex items-center justify-center group-hover:bg-kanban-accent-hover transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-sm">Forge Kanban</p>
            <p className="text-kanban-muted text-xs">Project Boards</p>
          </div>
        </Link>
      </div>

      {/* Board List */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs font-semibold text-kanban-muted uppercase tracking-wider">Your Boards</span>
          <button
            onClick={() => setShowCreate(true)}
            className="w-6 h-6 rounded-md bg-kanban-card hover:bg-kanban-border text-kanban-muted hover:text-white flex items-center justify-center transition-colors"
            title="Create board"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 bg-kanban-card rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!loading && boards.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 bg-kanban-card rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-kanban-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <p className="text-kanban-muted text-xs">No boards yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-2 text-kanban-accent hover:underline text-xs"
            >
              Create your first board
            </button>
          </div>
        )}

        <div className="space-y-1">
          {boards.map((board) => {
            const isActive = boardId === String(board.id);
            return (
              <div key={board.id} className="group relative flex items-center">
                <Link
                  to={`/boards/${board.id}`}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-kanban-accent/20 text-white'
                      : 'text-kanban-muted hover:bg-kanban-card hover:text-white'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: board.color || '#6366f1' }}
                  />
                  <span className="truncate font-medium">{board.name}</span>
                </Link>
                <button
                  onClick={() => setDeleteId(board.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-kanban-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Delete board"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Create Board Form */}
        {showCreate && (
          <div className="mt-4 mx-1 bg-kanban-card border border-kanban-border rounded-xl p-4 animate-slide-in">
            <h3 className="text-sm font-semibold text-white mb-3">New Board</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                autoFocus
                type="text"
                placeholder="Board name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-kanban-surface border border-kanban-border rounded-lg px-3 py-2 text-sm text-kanban-text placeholder:text-kanban-muted focus:outline-none focus:ring-1 focus:ring-kanban-accent"
              />
              <div className="flex flex-wrap gap-2">
                {BOARD_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`w-6 h-6 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-kanban-card' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-kanban-accent hover:bg-kanban-accent-hover text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-2 text-kanban-muted hover:text-white text-sm rounded-lg hover:bg-kanban-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-kanban-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-kanban-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-kanban-accent font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-kanban-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-kanban-muted hover:text-white hover:bg-kanban-border transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-kanban-surface border border-kanban-border rounded-2xl p-6 w-full max-w-sm shadow-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-2">Delete Board?</h3>
            <p className="text-kanban-muted text-sm mb-6">This will permanently delete the board and all its columns and tasks. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-kanban-border text-kanban-muted hover:text-white hover:border-kanban-accent transition-all text-sm font-medium">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
