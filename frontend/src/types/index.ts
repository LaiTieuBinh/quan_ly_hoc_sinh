export type AuthUser = {
  tai_khoan_id: string;
  ten_dang_nhap: string;
  vai_tro: string;
  ho_ten?: string | null;
  ho_so_lien_ket?: { loai: 'GIAO_VIEN' | 'HOC_SINH'; id: string } | null;
  quyen?: string[];
  phien: { het_han_luc: string; thoi_luong_phut?: number };
};

export type LoginCredentials = { username: string; password: string; rememberMe: boolean };

export type Student = {
  id: string;
  ma_hoc_sinh: string;
  ho_ten: string;
  cap_do_hien_tai: string;
  trang_thai: string;
  email: string | null;
  so_dien_thoai: string | null;
  gioi_tinh?: string | null;
  ngay_sinh?: string | null;
  dia_chi?: string | null;
  version: number;
};

export type Overview = {
  chi_so: {
    hoc_sinh: number;
    lop_hoc: number;
    giao_vien: number;
    dang_ky: number;
  };
  theo_cap_do: { cap_do: string; so_luong: number }[];
};
