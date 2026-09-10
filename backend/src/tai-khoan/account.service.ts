import { HttpException, Injectable } from '@nestjs/common';
import { Prisma, TrangThaiTaiKhoan, VaiTro } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { AccountInput, AccountStatus, fail, ListQuery, parseReset, ProfileQuery } from './account.input';

const safeSelect = {
  id: true, tenDangNhap: true, vaiTro: true, trangThai: true, createdAt: true, updatedAt: true,
  hocSinh: { select: { id: true, maHocSinh: true, hoTen: true } },
  giaoVien: { select: { id: true, maGiaoVien: true, hoTen: true } },
} satisfies Prisma.TaiKhoanSelect;
type SafeAccount = Prisma.TaiKhoanGetPayload<{ select: typeof safeSelect }>;
const dbStatus = (value: AccountStatus) => value === 'KHOA' ? TrangThaiTaiKhoan.BI_KHOA : TrangThaiTaiKhoan.HOAT_DONG;
const meta = (total: number, query: { page: number; page_size: number }) => ({ ...query, total, total_pages: Math.ceil(total / query.page_size) });
function numericId(id: bigint) {
  const number = Number(id);
  if (!Number.isSafeInteger(number)) throw new Error('ID exceeds supported JSON integer range.');
  return number;
}
function serialize(account: SafeAccount) {
  return { id: numericId(account.id), ten_dang_nhap: account.tenDangNhap, vai_tro: account.vaiTro,
    trang_thai: account.trangThai === 'BI_KHOA' ? 'KHOA' : 'HOAT_DONG',
    ho_so_lien_ket: account.giaoVien ? { loai: 'GIAO_VIEN', id: numericId(account.giaoVien.id), ma: account.giaoVien.maGiaoVien, ten: account.giaoVien.hoTen }
      : account.hocSinh ? { loai: 'HOC_SINH', id: numericId(account.hocSinh.id), ma: account.hocSinh.maHocSinh, ten: account.hocSinh.hoTen } : null,
    created_at: account.createdAt.toISOString(), updated_at: account.updatedAt.toISOString() };
}

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListQuery) {
    const where: Prisma.TaiKhoanWhereInput = { tenDangNhap: { contains: query.q, mode: 'insensitive' }, ...(query.vai_tro ? { vaiTro: query.vai_tro } : {}), ...(query.trang_thai ? { trangThai: dbStatus(query.trang_thai) } : {}) };
    const sortKey = { ten_dang_nhap: 'tenDangNhap', created_at: 'createdAt', updated_at: 'updatedAt' }[query.sort.replace(/^-/, '')]!;
    return this.prisma.$transaction(async tx => {
      const total = await tx.taiKhoan.count({ where });
      const rows = await tx.taiKhoan.findMany({ where, select: safeSelect, skip: (query.page - 1) * query.page_size, take: query.page_size, orderBy: [{ [sortKey]: query.sort.startsWith('-') ? 'desc' : 'asc' }, { id: 'asc' }] });
      return { data: rows.map(serialize), meta: meta(total, { page: query.page, page_size: query.page_size }) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async detail(id: number) {
    return this.prisma.$transaction(async tx => {
      const account = await this.find(tx, BigInt(id));
      const last = account.vaiTro === 'QUAN_TRI_VIEN' && account.trangThai === 'HOAT_DONG' && await tx.taiKhoan.count({ where: { vaiTro: 'QUAN_TRI_VIEN', trangThai: 'HOAT_DONG' } }) === 1;
      return { data: { ...serialize(account), hanh_dong_duoc_phep: ['CAP_NHAT', ...(account.trangThai === 'BI_KHOA' ? ['MO_KHOA'] : last ? [] : ['KHOA']), 'DAT_LAI_MAT_KHAU'] } };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async create(actor: AuthenticatedUser, input: AccountInput) {
    const hash = await argon2.hash(input.mat_khau!, { type: argon2.argon2id });
    return this.mutate(actor, 'TAO_TAI_KHOAN', undefined, async tx => {
      await this.usernameAvailable(tx, input.ten_dang_nhap!);
      const role = input.vai_tro!;
      const teacher = input.giao_vien_id ?? null, student = input.hoc_sinh_id ?? null;
      this.validateLinks(role, teacher, student);
      await this.profileAvailable(tx, teacher, student);
      const created = await tx.taiKhoan.create({ data: { tenDangNhap: input.ten_dang_nhap!, matKhauMaHoa: hash, vaiTro: role, trangThai: dbStatus(input.trang_thai ?? 'HOAT_DONG') }, select: { id: true } });
      await this.link(tx, created.id, teacher, student);
      const account = await this.find(tx, created.id);
      await this.audit(tx, actor, 'TAO_TAI_KHOAN', created.id, { sau: serialize(account) });
      return { data: serialize(account) };
    });
  }

  async update(actor: AuthenticatedUser, id: number, input: AccountInput, reason?: string, statusOnly = false) {
    const operation = statusOnly ? 'DOI_TRANG_THAI_TAI_KHOAN' : 'CAP_NHAT_TAI_KHOAN';
    return this.mutate(actor, operation, id, async tx => {
      const before = await this.find(tx, BigInt(id));
      const role = input.vai_tro ?? before.vaiTro;
      const status = input.trang_thai ? dbStatus(input.trang_thai) : before.trangThai;
      const teacher = input.giao_vien_id === undefined ? before.giaoVien ? numericId(before.giaoVien.id) : null : input.giao_vien_id;
      const student = input.hoc_sinh_id === undefined ? before.hocSinh ? numericId(before.hocSinh.id) : null : input.hoc_sinh_id;
      this.validateLinks(role, teacher, student);
      if (input.vai_tro && input.vai_tro !== before.vaiTro && ['QUAN_TRI_VIEN', 'NHAN_VIEN'].includes(role) && (input.giao_vien_id !== null || input.hoc_sinh_id !== null)) fail(422, 'INVALID_ROLE_PROFILE', 'Cần xác nhận gỡ cả hai liên kết hồ sơ bằng giá trị null.');
      if (before.vaiTro === 'QUAN_TRI_VIEN' && before.trangThai === 'HOAT_DONG' && (role !== 'QUAN_TRI_VIEN' || status !== 'HOAT_DONG')) {
        if (await tx.taiKhoan.count({ where: { vaiTro: 'QUAN_TRI_VIEN', trangThai: 'HOAT_DONG' } }) <= 1) fail(409, 'LAST_ACTIVE_ADMIN', 'Không thể vô hiệu hóa quản trị viên hoạt động cuối cùng.');
      }
      if (input.ten_dang_nhap !== undefined) await this.usernameAvailable(tx, input.ten_dang_nhap, before.id);
      await this.profileAvailable(tx, teacher, student, before.id);
      await tx.taiKhoan.update({ where: { id: before.id }, data: { tenDangNhap: input.ten_dang_nhap, vaiTro: role, trangThai: status } });
      await this.link(tx, before.id, teacher, student);
      if (status === 'BI_KHOA' || role !== before.vaiTro || teacher !== (before.giaoVien ? numericId(before.giaoVien.id) : null) || student !== (before.hocSinh ? numericId(before.hocSinh.id) : null)) await this.revoke(tx, before.id);
      const account = await this.find(tx, before.id);
      // A reason may contain arbitrary user text, so audit only whether one was supplied.
      await this.audit(tx, actor, operation, before.id, { truoc: serialize(before), sau: serialize(account), co_ly_do: !!reason });
      return { data: serialize(account) };
    });
  }

  async reset(actor: AuthenticatedUser, id: number, raw: unknown) {
    // Reserve attempts in the database before validation/hashing; shared across workers.
    try { await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(7303, 2)`;
      const recent = { hanhDong: 'YEU_CAU_DAT_LAI_MAT_KHAU', createdAt: { gte: new Date(Date.now() - 15 * 60_000) } };
      const targetCount = await tx.nhatKyThaoTac.count({ where: { ...recent, doiTuong: 'TaiKhoan', doiTuongId: String(id) } });
      const actorCount = await tx.nhatKyThaoTac.count({ where: { ...recent, taiKhoanId: BigInt(actor.id) } });
      if (targetCount >= 5 || actorCount >= 20) throw new HttpException({ code: 'PASSWORD_RESET_RATE_LIMITED', message: 'Vượt giới hạn đặt lại mật khẩu. Vui lòng thử lại sau.', retryAfter: 900 }, 429);
      await this.audit(tx, actor, 'YEU_CAU_DAT_LAI_MAT_KHAU', BigInt(id), {});
    }); } catch (error) { await this.auditFailure(actor, 'DAT_LAI_MAT_KHAU', id, error); throw error; }
    let input: ReturnType<typeof parseReset>;
    try { input = parseReset(raw); }
    catch (error) { await this.auditFailure(actor, 'DAT_LAI_MAT_KHAU', id, error); throw error; }
    const hash = await argon2.hash(input.password, { type: argon2.argon2id });
    return this.mutate(actor, 'DAT_LAI_MAT_KHAU', id, async tx => {
      const account = await this.find(tx, BigInt(id));
      const now = new Date();
      await tx.taiKhoan.update({ where: { id: account.id }, data: { matKhauMaHoa: hash, updatedAt: now } });
      if (input.revoke) await this.revoke(tx, account.id);
      await this.audit(tx, actor, 'DAT_LAI_MAT_KHAU', account.id, { thu_hoi_phien_hien_tai: input.revoke });
      return { data: { tai_khoan_id: id, dat_lai_luc: now.toISOString() } };
    });
  }

  async profiles(kind: 'teacher' | 'student', query: ProfileQuery) {
    return this.prisma.$transaction(async tx => {
      if (query.tai_khoan_id) await this.find(tx, BigInt(query.tai_khoan_id));
      const owner = query.tai_khoan_id ? BigInt(query.tai_khoan_id) : undefined;
      const available = [{ taiKhoanId: null }, ...(owner ? [{ taiKhoanId: owner }] : [])];
      const paging = { skip: (query.page - 1) * query.page_size, take: query.page_size };
      if (kind === 'teacher') {
        const where: Prisma.GiaoVienWhereInput = { AND: [{ OR: available }, { OR: [{ maGiaoVien: { contains: query.q, mode: 'insensitive' } }, { hoTen: { contains: query.q, mode: 'insensitive' } }] }, ...(query.include_inactive ? [] : [{ OR: [{ trangThai: 'HOAT_DONG' as const }, ...(owner ? [{ taiKhoanId: owner }] : [])] }])] };
        const total = await tx.giaoVien.count({ where });
        const rows = await tx.giaoVien.findMany({ where, ...paging, orderBy: [{ hoTen: 'asc' }, { id: 'asc' }], select: { id: true, maGiaoVien: true, hoTen: true, trangThai: true } });
        return { data: rows.map(p => ({ id: numericId(p.id), ma: p.maGiaoVien, ho_ten: p.hoTen, trang_thai: p.trangThai === 'HOAT_DONG' ? 'DANG_HOAT_DONG' : 'KHONG_AP_DUNG' })), meta: meta(total, { page: query.page, page_size: query.page_size }) };
      }
      const where: Prisma.HocSinhWhereInput = { AND: [{ OR: available }, { OR: [{ maHocSinh: { contains: query.q, mode: 'insensitive' } }, { hoTen: { contains: query.q, mode: 'insensitive' } }] }, ...(query.include_inactive ? [] : [{ OR: [{ trangThai: 'DANG_HOC' as const }, ...(owner ? [{ taiKhoanId: owner }] : [])] }])] };
      const total = await tx.hocSinh.count({ where });
      const rows = await tx.hocSinh.findMany({ where, ...paging, orderBy: [{ hoTen: 'asc' }, { id: 'asc' }], select: { id: true, maHocSinh: true, hoTen: true, trangThai: true } });
      return { data: rows.map(p => ({ id: numericId(p.id), ma: p.maHocSinh, ho_ten: p.hoTen, trang_thai: p.trangThai })), meta: meta(total, { page: query.page, page_size: query.page_size }) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  private async find(tx: Prisma.TransactionClient, id: bigint) {
    const account = await tx.taiKhoan.findUnique({ where: { id }, select: safeSelect });
    if (!account) fail(404, 'ACCOUNT_NOT_FOUND', 'Không tìm thấy tài khoản.');
    return account;
  }
  private async usernameAvailable(tx: Prisma.TransactionClient, username: string, id?: bigint) {
    if (await tx.taiKhoan.findFirst({ where: { tenDangNhap: { equals: username, mode: 'insensitive' }, ...(id ? { id: { not: id } } : {}) }, select: { id: true } })) fail(409, 'USERNAME_ALREADY_EXISTS', 'Tên đăng nhập đã tồn tại.', 'ten_dang_nhap');
  }
  private validateLinks(role: VaiTro, teacher: number | null, student: number | null) {
    if (role === 'GIAO_VIEN' ? !teacher || student !== null : role === 'HOC_SINH' ? !student || teacher !== null : teacher !== null || student !== null) fail(422, 'INVALID_ROLE_PROFILE', 'Hồ sơ liên kết phải tương ứng với vai trò.', role === 'HOC_SINH' ? 'hoc_sinh_id' : 'giao_vien_id');
  }
  private async profileAvailable(tx: Prisma.TransactionClient, teacher: number | null, student: number | null, accountId?: bigint) {
    const field = teacher !== null ? 'giao_vien_id' : 'hoc_sinh_id';
    const profile = teacher !== null ? await tx.giaoVien.findUnique({ where: { id: BigInt(teacher) }, select: { taiKhoanId: true } }) : student !== null ? await tx.hocSinh.findUnique({ where: { id: BigInt(student) }, select: { taiKhoanId: true } }) : undefined;
    if (profile === null) fail(404, 'PROFILE_NOT_FOUND', 'Không tìm thấy hồ sơ.', field);
    if (profile?.taiKhoanId && profile.taiKhoanId !== accountId) fail(409, 'PROFILE_ALREADY_LINKED', 'Hồ sơ đã được liên kết với tài khoản khác.', field);
  }
  private async link(tx: Prisma.TransactionClient, id: bigint, teacher: number | null, student: number | null) {
    await tx.giaoVien.updateMany({ where: { taiKhoanId: id }, data: { taiKhoanId: null } });
    await tx.hocSinh.updateMany({ where: { taiKhoanId: id }, data: { taiKhoanId: null } });
    if (teacher !== null) {
      const result = await tx.giaoVien.updateMany({ where: { id: BigInt(teacher), taiKhoanId: null }, data: { taiKhoanId: id } });
      if (result.count !== 1) fail(409, 'PROFILE_ALREADY_LINKED', 'Hồ sơ không còn khả dụng.', 'giao_vien_id');
    }
    if (student !== null) {
      const result = await tx.hocSinh.updateMany({ where: { id: BigInt(student), taiKhoanId: null }, data: { taiKhoanId: id } });
      if (result.count !== 1) fail(409, 'PROFILE_ALREADY_LINKED', 'Hồ sơ không còn khả dụng.', 'hoc_sinh_id');
    }
  }
  private revoke(tx: Prisma.TransactionClient, id: bigint) { return tx.phienDangNhap.updateMany({ where: { taiKhoanId: id, thuHoiLuc: null }, data: { thuHoiLuc: new Date() } }); }
  private audit(tx: Prisma.TransactionClient, actor: AuthenticatedUser, operation: string, id: bigint, data: Prisma.InputJsonObject) {
    return tx.nhatKyThaoTac.create({ data: { taiKhoanId: BigInt(actor.id), hanhDong: operation, doiTuong: 'TaiKhoan', doiTuongId: id.toString(), duLieu: data } });
  }
  private async auditFailure(actor: AuthenticatedUser, operation: string, id: number | undefined, error: unknown) {
    // Never log exception messages, request bodies, hashes, or tokens.
    await this.prisma.nhatKyThaoTac.create({ data: { taiKhoanId: BigInt(actor.id), hanhDong: `${operation}_THAT_BAI`, doiTuong: 'TaiKhoan', doiTuongId: id === undefined ? 'new' : String(id), duLieu: { http_status: error instanceof HttpException ? error.getStatus() : 500 } } });
  }
  private async mutate<T>(actor: AuthenticatedUser, operation: string, id: number | undefined, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(async tx => {
        // Serialize account administration across all API workers. ReadCommitted sees
        // the previous writer's commit after the lock; row locks also coordinate login.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(7303, 1)`;
        const ids = [...new Set([BigInt(actor.id), ...(id ? [BigInt(id)] : [])])].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
        for (const accountId of ids) await tx.$queryRaw`SELECT id FROM tai_khoan WHERE id = ${accountId} FOR UPDATE`;
        const current = await tx.taiKhoan.findUnique({ where: { id: BigInt(actor.id) }, select: { vaiTro: true, trangThai: true } });
        const session = await tx.phienDangNhap.findFirst({ where: { id: actor.sessionId, taiKhoanId: BigInt(actor.id), thuHoiLuc: null, hetHanLuc: { gt: new Date() } }, select: { id: true } });
        if (!current || current.trangThai !== 'HOAT_DONG' || !session) fail(401, 'UNAUTHENTICATED', 'Phiên đăng nhập không còn hợp lệ.');
        if (current.vaiTro !== 'QUAN_TRI_VIEN') fail(403, 'ADMIN_REQUIRED', 'Chỉ quản trị viên được quản lý tài khoản.');
        return work(tx);
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 10000 });
    } catch (error) {
      let safeError = error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const username = String(error.meta?.target).includes('ten_dang_nhap') || String(error.meta?.target).includes('tenDangNhap');
        safeError = new HttpException({ code: username ? 'USERNAME_ALREADY_EXISTS' : 'PROFILE_ALREADY_LINKED', message: username ? 'Tên đăng nhập đã tồn tại.' : 'Hồ sơ đã được liên kết với tài khoản khác.', fields: username ? { ten_dang_nhap: ['Tên đăng nhập đã tồn tại.'] } : {} }, 409);
      }
      await this.auditFailure(actor, operation, id, safeError);
      throw safeError;
    }
  }
}
