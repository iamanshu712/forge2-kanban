import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Board } from '../types';
import { boardsApi } from '../api/boards';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    boardsApi.list().then(({ data }) => {
      setBoards(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="w-8 h-8 border-4 border-kanban-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
      <div className="w-20 h-20 bg-kanban-surface border border-kanban-border rounded-3xl flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-kanban-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
        </svg>
      </div>
      {boards.length === 0 ? (
        <>
          <h2 className="text-2xl font-bold text-white mb-2">No boards yet</h2>
          <p className="text-kanban-muted mb-6">Create your first board from the sidebar to get started.</p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-white mb-2">Select a Board</h2>
          <p className="text-kanban-muted mb-6">Choose a board from the sidebar to start working.</p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {boards.slice(0, 4).map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/boards/${b.id}`)}
                className="flex items-center gap-3 p-4 bg-kanban-surface border border-kanban-border rounded-xl hover:border-kanban-accent hover:bg-kanban-card transition-all text-left"
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: b.color || '#6366f1' }} />
                <span className="text-white text-sm font-medium truncate">{b.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
