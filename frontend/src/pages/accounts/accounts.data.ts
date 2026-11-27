import { mutation, request } from '../../services/http';

export const roles = { QUAN_TRI_VIEN: 'Quản trị viên', NHAN_VIEN: 'Nhân viên', GIAO_VIEN: 'Giáo viên', HOC_SINH: 'Học sinh' } as const;
export type Role = keyof typeof roles;
export type Status = 'HOAT_DONG' | 'KHOA';
export type Profile = { id: number; ma: string; ten: string; loai: Role };
export type Account = { id: number; ten_dang_nhap: string; vai_tro: Role; trang_thai: Status; ho_so_lien_ket: Profile | null; created_at: string; updated_at: string };
export type Filters = { q: string; vai_tro: string; trang_thai: string; page: number; sort: string };
export type AccountInput = { ten_dang_nhap: string; vai_tro: Role; trang_thai: Status; giao_vien_id: number | null; hoc_sinh_id: number | null; mat_khau?: string };
export type AccountList = { data: Account[]; meta: { total: number; total_pages: number }; role_counts?: Record<Role, number> };

export const accountApi = {
  detail: async (id: number) => (await request<{ data: Account }>(`/tai-khoan/${id}`)).data,
  list: (filters: Filters) => request<AccountList>(`/tai-khoan?${new URLSearchParams({ ...filters, page: String(filters.page), page_size: '20' })}`),
  save: (id: number | undefined, data: AccountInput) => mutation<{ data: Account }>(id ? `/tai-khoan/${id}` : '/tai-khoan', id ? 'PATCH' : 'POST', data),
  status: (account: Account) => mutation<{ data: Account }>(`/tai-khoan/${account.id}/trang-thai`, 'PATCH', { trang_thai: account.trang_thai === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG' }),
  reset: (id: number, password: string, confirmation: string) => mutation(`/tai-khoan/${id}/dat-lai-mat-khau`, 'POST', { mat_khau_moi: password, xac_nhan_mat_khau: confirmation, thu_hoi_phien_hien_tai: true }),
  profiles: async (role: Role, id: number | undefined, q: string) => {
    const query = new URLSearchParams({ q, page_size: '100', ...(id ? { tai_khoan_id: String(id) } : {}) });
    const response = await request<{ data: { id: number; ma: string; ho_ten: string }[] }>(`/ho-so/${role === 'GIAO_VIEN' ? 'giao-vien' : 'hoc-sinh'}-kha-dung?${query}`);
    return response.data.map(item => ({ ...item, ten: item.ho_ten, loai: role }));
  },
};
