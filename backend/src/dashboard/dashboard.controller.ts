import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('overview')
  async overview() {
    const [hocSinh, lopHoc, giaoVien, dangKy, capDo] = await Promise.all([
      this.prisma.hocSinh.count({ where: { trangThai: 'DANG_HOC' } }), this.prisma.lopHoc.count({ where: { trangThai: 'HOAT_DONG' } }),
      this.prisma.giaoVien.count({ where: { trangThai: 'HOAT_DONG' } }), this.prisma.dangKyLop.count({ where: { trangThai: 'DANG_HOC' } }),
      this.prisma.hocSinh.groupBy({ by: ['capDoHienTai'], where: { trangThai: 'DANG_HOC' }, _count: true }),
    ]);
    return { chi_so: { hoc_sinh: hocSinh, lop_hoc: lopHoc, giao_vien: giaoVien, dang_ky: dangKy }, theo_cap_do: capDo.map(x => ({ cap_do: x.capDoHienTai, so_luong: x._count })) };
  }
}

