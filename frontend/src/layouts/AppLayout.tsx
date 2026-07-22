import React, { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import type { Board } from '../types';
import { boardsApi } from '../api/boards';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    boardsApi.list().then(({ data }) => {
      setBoards(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleBoardCreated = (board: Board) => {
    setBoards((prev) => [...prev, board]);
  };

  const handleBoardDeleted = (id: number) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-kanban-bg">
      <Sidebar
        boards={boards}
        loading={loading}
        onBoardCreated={handleBoardCreated}
        onBoardDeleted={handleBoardDeleted}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
