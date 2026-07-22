// ─── Domain Types ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Board {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  color: string;
  columns_count?: number;
  columns?: Column[];
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  tasks?: Task[];
  tasks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  created_at: string;
  updated_at: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface BoardFormData {
  name: string;
  description?: string;
  color?: string;
}

export interface ColumnFormData {
  name: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface MoveTaskData {
  column_id: number;
  position: number;
}
