import api from './client';
import type { Board, BoardFormData } from '../types';

export const boardsApi = {
  list: () =>
    api.get<Board[]>('/boards'),

  get: (id: number) =>
    api.get<Board>(`/boards/${id}`),

  create: (data: BoardFormData) =>
    api.post<Board>('/boards', data),

  update: (id: number, data: Partial<BoardFormData>) =>
    api.put<Board>(`/boards/${id}`, data),

  delete: (id: number) =>
    api.delete(`/boards/${id}`),
};
