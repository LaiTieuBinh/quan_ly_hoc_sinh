import type { Overview, Student } from '../types';
import { request as sessionRequest } from './http';

export const api = {
  overview: () => sessionRequest<Overview>('/dashboard/overview'),
  students: (query = '') => sessionRequest<{ data: Student[]; meta: { total: number } }>(`/hoc-sinh?q=${encodeURIComponent(query)}`),
  createStudent: (data: object) => sessionRequest<Student>('/hoc-sinh', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: object) => sessionRequest<Student>(`/hoc-sinh/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
