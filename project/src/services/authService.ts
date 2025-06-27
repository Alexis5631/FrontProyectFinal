import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.auth.login(email, password);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.auth.getCurrentUser();
    return response.data;
  },
};