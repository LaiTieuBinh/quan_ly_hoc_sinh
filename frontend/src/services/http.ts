const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

type ApiErrorBody = { error?: { code?: string; message?: string | string[]; fields?: Record<string, string | string[]> } };

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string, public readonly fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshRequest: Promise<boolean> | null = null;
let csrfRequest: Promise<string> | null = null;
const sessionExpiredListeners = new Set<() => void>();

export function onSessionExpired(listener: () => void) {
  sessionExpiredListeners.add(listener);
  return () => { sessionExpiredListeners.delete(listener); };
}

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
    const fields = Object.fromEntries(Object.entries(body?.error?.fields ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value.join(' ') : value]));
    throw new ApiError(Array.isArray(message) ? message.join(' ') : message ?? 'Không thể kết nối máy chủ.', response.status, body?.error?.code, fields);
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
  if (response.status === 401 && canRefresh) sessionExpiredListeners.forEach(listener => listener());
  return parseResponse<T>(response);
}

async function csrfToken() {
  // Share in-flight token requests so simultaneous writes use the same CSRF cookie.
  if (!csrfRequest) csrfRequest = request<{ data: { csrf_token: string } }>('/auth/csrf-token')
    .then(response => response.data.csrf_token)
    .finally(() => { csrfRequest = null; });
  return csrfRequest;
}

export async function mutation<T>(path: string, method: 'POST' | 'PATCH', body: object): Promise<T> {
  const send = async () => request<T>(path, { method, headers: { 'X-CSRF-Token': await csrfToken() }, body: JSON.stringify(body) });
  try { return await send(); }
  catch (error) {
    // A different tab can rotate the cookie. CSRF rejection occurs before any write.
    if (error instanceof ApiError && error.code === 'CSRF_INVALID') return send();
    throw error;
  }
}
