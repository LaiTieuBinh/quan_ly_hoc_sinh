import { request } from '../../services/http';

export const roles = { QUAN_TRI_VIEN: 'Quản trị viên', NHAN_VIEN: 'Nhân viên', GIAO_VIEN: 'Giáo viên', HOC_SINH: 'Học sinh' } as const;
export type Role = keyof typeof roles;
export type Status = 'HOAT_DONG' | 'KHOA';
export type Profile = { id: number; ma: string; ten: string; loai: Role };
export type Account = { id: number; ten_dang_nhap: string; vai_tro: Role; trang_thai: Status; ho_so_lien_ket: Profile | null; created_at: string; updated_at: string };
export type Filters = { q: string; vai_tro: string; trang_thai: string; page: number; sort: string };
export type AccountInput = { ten_dang_nhap: string; vai_tro: Role; trang_thai: Status; giao_vien_id: number | null; hoc_sinh_id: number | null; mat_khau?: string };
export type AccountList = { data: Account[]; meta: { total: number; total_pages: number } };

export const accountApi = {
  list: (filters: Filters) => request<AccountList>(`/tai-khoan?${new URLSearchParams({ ...filters, page: String(filters.page), page_size: '20' })}`),
  save: (id: number | undefined, data: AccountInput) => request(id ? `/tai-khoan/${id}` : '/tai-khoan', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(data) }),
  status: (account: Account) => request(`/tai-khoan/${account.id}/trang-thai`, { method: 'PATCH', body: JSON.stringify({ trang_thai: account.trang_thai === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG' }) }),
  reset: (id: number, password: string, confirmation: string) => request(`/tai-khoan/${id}/dat-lai-mat-khau`, { method: 'POST', body: JSON.stringify({ mat_khau_moi: password, xac_nhan_mat_khau: confirmation, thu_hoi_phien_hien_tai: true }) }),
  profiles: async (role: Role, id: number | undefined, q: string) => {
    const query = new URLSearchParams({ q, page_size: '100', ...(id ? { tai_khoan_id: String(id) } : {}) });
    const response = await request<{ data: { id: number; ma: string; ho_ten: string }[] }>(`/ho-so/${role === 'GIAO_VIEN' ? 'giao-vien' : 'hoc-sinh'}-kha-dung?${query}`);
    return response.data.map(item => ({ ...item, ten: item.ho_ten, loai: role }));
  },
};

const names = ['Nguyễn Minh Anh', 'Trần Hoàng Nam', 'Lê Ngọc Hà', 'Phạm Thùy Linh', 'Đỗ Tuấn Kiệt', 'Vũ Khánh Vy', 'Bùi Gia Huy', 'Hoàng Mai Chi', 'Đặng Hải Yến', 'Ngô Nhật Minh', 'Trịnh Bảo Ngọc', 'Phan Đức Anh'];
export const sampleProfiles: Profile[] = names.flatMap((ten, i) => [
  { id: i + 1, ma: `GV${String(i + 1).padStart(3, '0')}`, ten, loai: 'GIAO_VIEN' as Role },
  { id: i + 101, ma: `HS${String(i + 1).padStart(3, '0')}`, ten, loai: 'HOC_SINH' as Role },
]);
export function createSampleAccounts(): Account[] {
  return Array.from({ length: 26 }, (_, i) => {
    const role: Role = i === 0 ? 'QUAN_TRI_VIEN' : i < 3 ? 'NHAN_VIEN' : i < 14 ? 'GIAO_VIEN' : 'HOC_SINH';
    const profile = role === 'GIAO_VIEN' ? sampleProfiles.find(p => p.loai === role && p.id === i - 2) : role === 'HOC_SINH' ? sampleProfiles.find(p => p.loai === role && p.id === i + 87) : null;
    return { id: i + 1, ten_dang_nhap: i === 0 ? 'admin.tokuda' : `${role === 'GIAO_VIEN' ? 'gv' : role === 'HOC_SINH' ? 'hs' : 'nv'}.${['minhanh', 'hoangnam', 'ngocha', 'thuylinh', 'tuankiet', 'khanhvy', 'giahuy', 'maichi', 'haiyen', 'nhatminh', 'baongoc', 'ducanh'][i % 12]}${i > 23 ? '02' : ''}`, vai_tro: role, trang_thai: i % 7 === 5 ? 'KHOA' : 'HOAT_DONG', ho_so_lien_ket: profile ?? null, created_at: '2026-08-20T08:30:00+07:00', updated_at: new Date(Date.UTC(2026, 8, 10, 3, 30 - i)).toISOString() };
  });
}
