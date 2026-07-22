import api from './client';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const authApi = {
  register: (data: RegisterCredentials) =>
    api.post<AuthResponse>('/register', data),

  login: (data: LoginCredentials) =>
    api.post<AuthResponse>('/login', data),

  logout: () =>
    api.post('/logout'),

  me: () =>
    api.get<AuthResponse['user']>('/user'),
};
