const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

type ApiErrorBody = { error?: { code?: string; message?: string | string[]; fields?: Record<string, string> } };

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string, public readonly fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshRequest: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null) as (ApiErrorBody & T) | null;
  if (!response.ok) {
    const message = body?.error?.message;
    throw new ApiError(Array.isArray(message) ? message.join(' ') : message ?? 'Không thể kết nối máy chủ.', response.status, body?.error?.code, body?.error?.fields);
  }
  return body as T;
}

export async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const canRefresh = path !== '/auth/login' && path !== '/auth/refresh';
  if (retry && response.status === 401 && canRefresh && await refreshSession()) return request<T>(path, options, false);
  return parseResponse<T>(response);
}
