import api from './client';
import type { Column, ColumnFormData } from '../types';

export const columnsApi = {
  create: (boardId: number, data: ColumnFormData) =>
    api.post<Column>(`/boards/${boardId}/columns`, data),

  update: (id: number, data: Partial<ColumnFormData>) =>
    api.put<Column>(`/columns/${id}`, data),

  delete: (id: number) =>
    api.delete(`/columns/${id}`),

  reorder: (id: number, position: number) =>
    api.patch<Column>(`/columns/${id}/reorder`, { position }),
};
