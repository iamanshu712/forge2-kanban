import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { Board, Column, Task } from '../types';
import { boardsApi } from '../api/boards';
import { columnsApi } from '../api/columns';
import { tasksApi } from '../api/tasks';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

type ActiveItem =
  | { type: 'column'; column: Column }
  | { type: 'task'; task: Task };

export default function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Column creation
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [creatingCol, setCreatingCol] = useState(false);

  // Board rename
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [boardName, setBoardName] = useState('');

  // Task modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // DnD state
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await boardsApi.get(Number(boardId));
      setBoard(data);
      setBoardName(data.name);
      setColumns(data.columns || []);
    } catch {
      setError('Failed to load board.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  // ─── Helper: find column containing a task ────────────────────────────────

  const findColumnByTaskId = useCallback((taskId: number) => {
    return columns.find((col) => (col.tasks || []).some((t) => t.id === taskId));
  }, [columns]);

  // ─── Board Rename ─────────────────────────────────────────────────────────

  const handleBoardRename = async () => {
    if (!board || !boardName.trim() || boardName === board.name) {
      setBoardName(board?.name || '');
      setEditingBoardName(false);
      return;
    }
    try {
      const { data } = await boardsApi.update(board.id, { name: boardName.trim() });
      setBoard(data);
    } finally {
      setEditingBoardName(false);
    }
  };

  // ─── Column CRUD ──────────────────────────────────────────────────────────

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim() || !board) return;
    setCreatingCol(true);
    try {
      const { data } = await columnsApi.create(board.id, { name: newColName.trim() });
      setColumns((prev) => [...prev, { ...data, tasks: [] }]);
      setNewColName('');
      setAddingColumn(false);
    } finally {
      setCreatingCol(false);
    }
  };

  const handleColumnUpdated = useCallback((updated: Column) => {
    setColumns((prev) => prev.map((c) => c.id === updated.id ? { ...c, name: updated.name } : c));
  }, []);

  const handleColumnDeleted = useCallback((id: number) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ─── Task CRUD ────────────────────────────────────────────────────────────

  const handleTaskCreated = useCallback((task: Task) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === task.column_id
          ? { ...col, tasks: [...(col.tasks || []), task] }
          : col
      )
    );
  }, []);

  const handleTaskUpdated = useCallback((updated: Task) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: (col.tasks || []).map((t) => (t.id === updated.id ? updated : t)),
      }))
    );
    setSelectedTask(updated);
  }, []);

  const handleTaskDeleted = useCallback((id: number) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: (col.tasks || []).filter((t) => t.id !== id),
      }))
    );
    setSelectedTask(null);
  }, []);

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === 'column') {
      setActiveItem({ type: 'column', column: data.column as Column });
    } else if (data?.type === 'task') {
      setActiveItem({ type: 'task', task: data.task as Task });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    if (activeData?.type !== 'task') return;

    const activeTask = activeData.task as Task;
    const overId = String(over.id);
    const overData = over.data.current;

    // Moving over another task
    if (overData?.type === 'task') {
      const overTask = overData.task as Task;
      if (activeTask.column_id === overTask.column_id) return; // same column, handled in dragEnd

      // Move task to the target column
      setColumns((prev) => {
        const newCols = prev.map((col) => {
          if (col.id === activeTask.column_id) {
            return { ...col, tasks: (col.tasks || []).filter((t) => t.id !== activeTask.id) };
          }
          if (col.id === overTask.column_id) {
            const overIndex = (col.tasks || []).findIndex((t) => t.id === overTask.id);
            const newTasks = [...(col.tasks || [])];
            newTasks.splice(overIndex, 0, { ...activeTask, column_id: overTask.column_id });
            return { ...col, tasks: newTasks };
          }
          return col;
        });
        return newCols;
      });
      // Update activeTask.column_id reference
      activeTask.column_id = overTask.column_id;
      return;
    }

    // Moving over a column
    if (overId.startsWith('col-')) {
      const targetColId = Number(overId.replace('col-', ''));
      if (activeTask.column_id === targetColId) return;
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === activeTask.column_id) {
            return { ...col, tasks: (col.tasks || []).filter((t) => t.id !== activeTask.id) };
          }
          if (col.id === targetColId) {
            return { ...col, tasks: [...(col.tasks || []), { ...activeTask, column_id: targetColId }] };
          }
          return col;
        })
      );
      activeTask.column_id = targetColId;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // ── Column reorder ─────────────────────────────────────────────────────
    if (activeData?.type === 'column' && overData?.type === 'column') {
      const activeColId = (activeData.column as Column).id;
      const overColId = (overData.column as Column).id;
      if (activeColId === overColId) return;

      const oldIndex = columns.findIndex((c) => c.id === activeColId);
      const newIndex = columns.findIndex((c) => c.id === overColId);
      const reordered = arrayMove(columns, oldIndex, newIndex);
      setColumns(reordered);

      // Persist new positions
      await Promise.all(
        reordered.map((col, idx) => columnsApi.reorder(col.id, idx))
      );
      return;
    }

    // ── Task reorder or move ───────────────────────────────────────────────
    if (activeData?.type === 'task') {
      const activeTask = activeData.task as Task;
      const targetColId = activeTask.column_id; // may have been updated by dragOver
      const targetCol = columns.find((c) => c.id === targetColId);
      if (!targetCol) return;

      const tasks = targetCol.tasks || [];
      const activeIdx = tasks.findIndex((t) => t.id === activeTask.id);

      let newPosition = activeIdx;
      if (overData?.type === 'task') {
        const overTask = overData.task as Task;
        if (overTask.column_id === targetColId) {
          newPosition = tasks.findIndex((t) => t.id === overTask.id);
        }
      }

      // Re-sort tasks in column
      const reordered = [...tasks];
      if (activeIdx !== newPosition && activeIdx >= 0) {
        const [removed] = reordered.splice(activeIdx, 1);
        reordered.splice(newPosition, 0, removed);
        setColumns((prev) =>
          prev.map((c) => c.id === targetColId ? { ...c, tasks: reordered } : c)
        );
      }

      // Persist move to backend
      await tasksApi.move(activeTask.id, {
        column_id: targetColId,
        position: newPosition >= 0 ? newPosition : 0,
      });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-kanban-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-kanban-muted text-sm">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <p className="text-red-400">{error}</p>
        <button onClick={() => navigate('/boards')} className="text-kanban-accent hover:underline text-sm">
          Back to boards
        </button>
      </div>
    );
  }

  if (!board) return null;

  const columnIds = columns.map((c) => `col-${c.id}`);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Board Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-kanban-border bg-kanban-surface flex-shrink-0">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: board.color || '#6366f1' }}
        />
        {editingBoardName ? (
          <input
            autoFocus
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onBlur={handleBoardRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBoardRename();
              if (e.key === 'Escape') { setBoardName(board.name); setEditingBoardName(false); }
            }}
            className="text-xl font-bold text-white bg-kanban-card border border-kanban-accent rounded-lg px-3 py-1 focus:outline-none"
          />
        ) : (
          <h2
            className="text-xl font-bold text-white cursor-pointer hover:text-kanban-accent transition-colors"
            onDoubleClick={() => setEditingBoardName(true)}
            title="Double-click to rename"
          >
            {board.name}
          </h2>
        )}
        <div className="flex-1" />
        <span className="text-kanban-muted text-sm">{columns.length} columns · {columns.reduce((sum, c) => sum + (c.tasks?.length || 0), 0)} tasks</span>
        <button
          onClick={() => setAddingColumn(true)}
          className="flex items-center gap-2 px-4 py-2 bg-kanban-accent hover:bg-kanban-accent-hover text-white text-sm font-medium rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Column
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 h-full items-start">
              {columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  onTaskOpen={setSelectedTask}
                  onTaskCreated={handleTaskCreated}
                  onTaskUpdated={handleTaskUpdated}
                  onColumnUpdated={handleColumnUpdated}
                  onColumnDeleted={handleColumnDeleted}
                />
              ))}

              {/* Add Column Form */}
              {addingColumn ? (
                <div className="flex-shrink-0 w-72 bg-kanban-surface border border-kanban-border rounded-2xl p-4 animate-slide-in">
                  <h4 className="text-sm font-semibold text-white mb-3">New Column</h4>
                  <form onSubmit={handleCreateColumn} className="space-y-3">
                    <input
                      autoFocus
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') { setAddingColumn(false); setNewColName(''); } }}
                      placeholder="Column name..."
                      className="w-full bg-kanban-card border border-kanban-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-kanban-muted focus:outline-none focus:ring-2 focus:ring-kanban-accent"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={creatingCol || !newColName.trim()}
                        className="flex-1 bg-kanban-accent hover:bg-kanban-accent-hover text-white text-sm font-medium py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {creatingCol ? 'Adding...' : 'Add Column'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingColumn(false); setNewColName(''); }}
                        className="px-3 py-2 text-kanban-muted hover:text-white text-sm rounded-xl hover:bg-kanban-card transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setAddingColumn(true)}
                  className="flex-shrink-0 w-72 h-20 flex items-center justify-center gap-2 border-2 border-dashed border-kanban-border rounded-2xl text-kanban-muted hover:text-white hover:border-kanban-accent transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium">Add Column</span>
                </button>
              )}
            </div>
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem?.type === 'task' && (
              <div className="rotate-2 opacity-90">
                <TaskCard task={activeItem.task} onOpen={() => {}} />
              </div>
            )}
            {activeItem?.type === 'column' && (
              <div className="opacity-80 shadow-card-hover">
                <div className="w-72 bg-kanban-surface border-2 border-kanban-accent rounded-2xl p-4">
                  <p className="font-semibold text-white">{activeItem.column.name}</p>
                  <p className="text-kanban-muted text-xs mt-1">{(activeItem.column.tasks || []).length} tasks</p>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
