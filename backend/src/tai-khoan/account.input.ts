import { HttpException } from '@nestjs/common';
import { VaiTro } from '@prisma/client';

export type AccountStatus = 'HOAT_DONG' | 'KHOA';
export interface AccountInput {
  ten_dang_nhap?: string; mat_khau?: string; vai_tro?: VaiTro; trang_thai?: AccountStatus;
  giao_vien_id?: number | null; hoc_sinh_id?: number | null;
}
export interface ListQuery { q: string; page: number; page_size: number; sort: string; vai_tro?: VaiTro; trang_thai?: AccountStatus }
export interface ProfileQuery { q: string; page: number; page_size: number; tai_khoan_id?: number; include_inactive: boolean }
export function fail(status: number, code: string, message: string, field?: string): never {
  throw new HttpException({ code, message, fields: field ? { [field]: [message] } : {} }, status);
}
function object(raw: unknown, allowed: string[], query = false): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail(query ? 400 : 422, query ? 'INVALID_QUERY' : 'VALIDATION_ERROR', 'Dữ liệu đầu vào không hợp lệ.');
  const value = raw as Record<string, unknown>;
  if (Object.keys(value).some(key => !allowed.includes(key))) fail(query ? 400 : 422, query ? 'INVALID_QUERY' : 'VALIDATION_ERROR', 'Yêu cầu chứa trường không được hỗ trợ.');
  return value;
}
function text(value: unknown, field: string, max: number, query = false) {
  if (typeof value !== 'string' || value.trim().length > max || (!query && !value.trim())) fail(query ? 400 : 422, query ? 'INVALID_QUERY' : 'VALIDATION_ERROR', 'Giá trị không hợp lệ hoặc vượt độ dài cho phép.', field);
  return value.trim();
}
export function positiveId(value: unknown, field = 'id', query = true): number {
  const parsed = query && typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : value;
  if (typeof parsed !== 'number' || !Number.isSafeInteger(parsed) || parsed <= 0) fail(query ? 400 : 422, query ? 'INVALID_QUERY' : 'VALIDATION_ERROR', 'ID phải là số nguyên dương hợp lệ.', field);
  return parsed;
}
function enumValue<T extends string>(value: unknown, values: readonly T[], field: string, query = false): T {
  if (typeof value !== 'string' || !values.includes(value as T)) fail(query ? 400 : 422, query ? 'INVALID_QUERY' : 'VALIDATION_ERROR', 'Giá trị lựa chọn không hợp lệ.', field);
  return value as T;
}
export function password(value: unknown, field: string): string {
  // Unicode length is counted by code points. Never trim or include the secret in errors.
  if (typeof value !== 'string' || [...value].length < 12 || [...value].length > 128 || !value.trim()) fail(422, 'VALIDATION_ERROR', 'Mật khẩu phải có từ 12 đến 128 ký tự.', field);
  return value;
}
export function parseAccount(raw: unknown, create: boolean): AccountInput {
  const value = object(raw, ['ten_dang_nhap', 'vai_tro', 'trang_thai', 'giao_vien_id', 'hoc_sinh_id', ...(create ? ['mat_khau'] : [])]);
  if (!create && !Object.keys(value).length) fail(422, 'VALIDATION_ERROR', 'Cần cung cấp ít nhất một trường cập nhật.');
  const result: AccountInput = {};
  if (create || value.ten_dang_nhap !== undefined) result.ten_dang_nhap = text(value.ten_dang_nhap, 'ten_dang_nhap', 100);
  if (create || value.vai_tro !== undefined) result.vai_tro = enumValue(value.vai_tro, Object.values(VaiTro), 'vai_tro');
  if (create || value.trang_thai !== undefined) result.trang_thai = enumValue(value.trang_thai === undefined ? 'HOAT_DONG' : value.trang_thai, ['HOAT_DONG', 'KHOA'] as const, 'trang_thai');
  for (const field of ['giao_vien_id', 'hoc_sinh_id'] as const) if (value[field] !== undefined) result[field] = value[field] === null ? null : positiveId(value[field], field, false);
  if (create) result.mat_khau = password(value.mat_khau, 'mat_khau');
  return result;
}
function pagination(value: Record<string, unknown>) {
  const page = value.page === undefined ? 1 : positiveId(value.page, 'page');
  const page_size = value.page_size === undefined ? 20 : positiveId(value.page_size, 'page_size');
  if (page_size > 100 || !Number.isSafeInteger((page - 1) * page_size) || (page - 1) * page_size > 2147483647) fail(400, 'INVALID_QUERY', 'Phân trang không hợp lệ.', 'page_size');
  return { page, page_size };
}
export function parseList(raw: unknown): ListQuery {
  const value = object(raw, ['q', 'vai_tro', 'trang_thai', 'page', 'page_size', 'sort'], true);
  return { ...pagination(value), q: value.q === undefined ? '' : text(value.q, 'q', 100, true),
    sort: value.sort === undefined ? '-updated_at' : enumValue(value.sort, ['ten_dang_nhap', '-ten_dang_nhap', 'created_at', '-created_at', 'updated_at', '-updated_at'], 'sort', true),
    ...(value.vai_tro ? { vai_tro: enumValue(value.vai_tro, Object.values(VaiTro), 'vai_tro', true) } : {}),
    ...(value.trang_thai ? { trang_thai: enumValue(value.trang_thai, ['HOAT_DONG', 'KHOA'] as const, 'trang_thai', true) } : {}),
  };
}
export function parseProfiles(raw: unknown): ProfileQuery {
  const value = object(raw, ['q', 'page', 'page_size', 'tai_khoan_id', 'include_inactive'], true);
  if (value.include_inactive !== undefined && !['true', 'false'].includes(value.include_inactive as string)) fail(400, 'INVALID_QUERY', 'include_inactive phải là true hoặc false.', 'include_inactive');
  return { ...pagination(value), q: value.q === undefined ? '' : text(value.q, 'q', 150, true), include_inactive: value.include_inactive === 'true', ...(value.tai_khoan_id !== undefined ? { tai_khoan_id: positiveId(value.tai_khoan_id, 'tai_khoan_id') } : {}) };
}
export function parseStatus(raw: unknown) {
  const value = object(raw, ['trang_thai', 'ly_do']);
  return { trang_thai: enumValue(value.trang_thai, ['HOAT_DONG', 'KHOA'] as const, 'trang_thai'), ...(value.ly_do !== undefined ? { ly_do: text(value.ly_do, 'ly_do', 500) } : {}) };
}
export function parseReset(raw: unknown) {
  const value = object(raw, ['mat_khau_moi', 'xac_nhan_mat_khau', 'thu_hoi_phien_hien_tai']);
  const secret = password(value.mat_khau_moi, 'mat_khau_moi');
  if (secret !== value.xac_nhan_mat_khau) fail(422, 'VALIDATION_ERROR', 'Mật khẩu xác nhận không khớp.', 'xac_nhan_mat_khau');
  if (value.thu_hoi_phien_hien_tai !== undefined && typeof value.thu_hoi_phien_hien_tai !== 'boolean') fail(422, 'VALIDATION_ERROR', 'Giá trị phải là boolean.', 'thu_hoi_phien_hien_tai');
  return { password: secret, revoke: value.thu_hoi_phien_hien_tai !== false };
}
