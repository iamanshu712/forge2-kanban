import api from './client';
import type { Task, TaskFormData, MoveTaskData } from '../types';

export const tasksApi = {
  create: (columnId: number, data: TaskFormData) =>
    api.post<Task>(`/columns/${columnId}/tasks`, data),

  get: (id: number) =>
    api.get<Task>(`/tasks/${id}`),

  update: (id: number, data: Partial<TaskFormData>) =>
    api.put<Task>(`/tasks/${id}`, data),

  delete: (id: number) =>
    api.delete(`/tasks/${id}`),

  move: (id: number, data: MoveTaskData) =>
    api.patch<Task>(`/tasks/${id}/move`, data),
};
