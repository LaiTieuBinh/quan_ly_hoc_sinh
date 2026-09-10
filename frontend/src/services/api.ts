import type { Overview, Student } from '../types';
import { request as sessionRequest } from './http';

export const api = {
  overview: () => sessionRequest<Overview>('/dashboard/overview'),
  students: (query = '', page = 1, status = '', level = '') => sessionRequest<{ data: Student[]; meta: { total: number; total_pages: number } }>(`/hoc-sinh?${new URLSearchParams({ q: query, page: String(page), page_size: '20', trang_thai: status, cap_do: level })}`),
  createStudent: (data: object) => sessionRequest<Student>('/hoc-sinh', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: object) => sessionRequest<Student>(`/hoc-sinh/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
