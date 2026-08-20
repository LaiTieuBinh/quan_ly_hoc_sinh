const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
export type User = { id: string; ten_dang_nhap: string; vai_tro: string };
export type Student = { id: string; ma_hoc_sinh: string; ho_ten: string; cap_do_hien_tai: string; trang_thai: string; email: string | null; so_dien_thoai: string | null; version: number };
export type Overview = { chi_so: { hoc_sinh: number; lop_hoc: number; giao_vien: number; dang_ky: number }; theo_cap_do: { cap_do: string; so_luong: number }[] };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (!response.ok) { const body = await response.json().catch(() => null) as { error?: { message?: string | string[] } } | null; const msg = body?.error?.message; throw new Error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Không thể kết nối máy chủ.'); }
  return response.json() as Promise<T>;
}
export const api = {
  login: (username: string, password: string) => request<{ access_token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ ten_dang_nhap: username, mat_khau: password }) }),
  overview: () => request<Overview>('/dashboard/overview'),
  students: (q = '') => request<{ data: Student[]; meta: { total: number } }>(`/hoc-sinh?q=${encodeURIComponent(q)}`),
  createStudent: (data: object) => request<Student>('/hoc-sinh', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: object) => request<Student>(`/hoc-sinh/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

