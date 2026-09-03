import type { AuthUser, LoginCredentials } from '../types';
import { request } from './http';

type DataResponse<T> = { data: T };

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await request<DataResponse<AuthUser>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ten_dang_nhap: credentials.username, mat_khau: credentials.password, remember_me: credentials.rememberMe }),
    });
    return response.data;
  },
  async me(): Promise<AuthUser> {
    const response = await request<DataResponse<AuthUser>>('/auth/me');
    return response.data;
  },
  async logout(revokeAllSessions = false): Promise<void> {
    const csrf = await request<DataResponse<{ csrf_token: string }>>('/auth/csrf-token');
    await request<void>('/auth/logout', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrf.data.csrf_token },
      body: JSON.stringify({ thu_hoi_tat_ca_phien: revokeAllSessions }),
    });
  },
};
