import { Injectable } from '@nestjs/common';
import { Prisma, TrangThaiTaiKhoan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}
  findAccount(username: string) { return this.prisma.taiKhoan.findUnique({ where: { tenDangNhap: username }, select: { id: true, tenDangNhap: true, matKhauMaHoa: true, vaiTro: true, trangThai: true } }); }
  findProfile(accountId: bigint) { return this.prisma.taiKhoan.findUnique({ where: { id: accountId }, select: { id: true, tenDangNhap: true, vaiTro: true, trangThai: true, hocSinh: { select: { id: true, hoTen: true } }, giaoVien: { select: { id: true, hoTen: true } } } }); }
  createSession(data: { id: string; accountId: bigint; refreshHash: string; expiresAt: Date; ip?: string; userAgent?: string }) { return this.prisma.phienDangNhap.create({ data: { id: data.id, taiKhoanId: data.accountId, refreshTokenHash: data.refreshHash, hetHanLuc: data.expiresAt, diaChiIp: data.ip, userAgent: data.userAgent } }); }
  findActiveSession(id: string) { return this.prisma.phienDangNhap.findFirst({ where: { id, thuHoiLuc: null, hetHanLuc: { gt: new Date() }, taiKhoan: { trangThai: TrangThaiTaiKhoan.HOAT_DONG } }, select: { id: true, taiKhoanId: true, refreshTokenHash: true, hetHanLuc: true } }); }
  rotateSession(id: string, oldHash: string, newHash: string, expiresAt: Date) { return this.prisma.phienDangNhap.updateMany({ where: { id, refreshTokenHash: oldHash, thuHoiLuc: null, hetHanLuc: { gt: new Date() } }, data: { refreshTokenHash: newHash, hetHanLuc: expiresAt } }); }
  revokeSession(id: string) { return this.prisma.phienDangNhap.updateMany({ where: { id, thuHoiLuc: null }, data: { thuHoiLuc: new Date() } }); }
  revokeAllSessions(accountId: bigint) { return this.prisma.phienDangNhap.updateMany({ where: { taiKhoanId: accountId, thuHoiLuc: null }, data: { thuHoiLuc: new Date() } }); }
  logLogin(data: { accountId?: bigint; username: string; success: boolean; ip?: string; userAgent?: string }) {
    const payload: Prisma.NhatKyDangNhapUncheckedCreateInput = { taiKhoanId: data.accountId, tenDangNhap: data.username, thanhCong: data.success, diaChiIp: data.ip, userAgent: data.userAgent };
    return this.prisma.nhatKyDangNhap.create({ data: payload });
  }
}
