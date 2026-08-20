import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHocSinhDto, UpdateHocSinhDto } from './hoc-sinh.dto';

@Injectable()
export class HocSinhService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(q = '', page = 1, pageSize = 20) {
    const where: Prisma.HocSinhWhereInput = q ? { OR: [{ maHocSinh: { contains: q, mode: 'insensitive' } }, { hoTen: { contains: q, mode: 'insensitive' } }] } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.hocSinh.findMany({ where, skip: (page - 1) * pageSize, take: Math.min(pageSize, 100), orderBy: { createdAt: 'desc' } }),
      this.prisma.hocSinh.count({ where }),
    ]);
    return { data: items.map(this.serialize), meta: { page, page_size: pageSize, total, total_pages: Math.ceil(total / pageSize) } };
  }
  async create(dto: CreateHocSinhDto, actorId: string) {
    try {
      const item = await this.prisma.$transaction(async tx => {
        const created = await tx.hocSinh.create({ data: { maHocSinh: dto.ma_hoc_sinh, hoTen: dto.ho_ten, capDoHienTai: dto.cap_do_hien_tai, email: dto.email, soDienThoai: dto.so_dien_thoai, trangThai: dto.trang_thai } });
        await tx.nhatKyThaoTac.create({ data: { taiKhoanId: BigInt(actorId), hanhDong: 'TAO', doiTuong: 'HOC_SINH', doiTuongId: created.id.toString() } });
        return created;
      });
      return this.serialize(item);
    } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Mã học sinh đã tồn tại.'); throw error; }
  }
  async update(id: string, dto: UpdateHocSinhDto, actorId: string) {
    const exists = await this.prisma.hocSinh.findUnique({ where: { id: BigInt(id) } });
    if (!exists) throw new NotFoundException('Không tìm thấy học sinh.');
    const item = await this.prisma.$transaction(async tx => {
      const updated = await tx.hocSinh.update({ where: { id: BigInt(id) }, data: { hoTen: dto.ho_ten, email: dto.email, soDienThoai: dto.so_dien_thoai, trangThai: dto.trang_thai, version: { increment: 1 } } });
      await tx.nhatKyThaoTac.create({ data: { taiKhoanId: BigInt(actorId), hanhDong: 'CAP_NHAT', doiTuong: 'HOC_SINH', doiTuongId: id, duLieu: dto } });
      return updated;
    });
    return this.serialize(item);
  }
  private serialize(item: { id: bigint; maHocSinh: string; hoTen: string; capDoHienTai: string; trangThai: string; email: string | null; soDienThoai: string | null; version: number }) {
    return { id: item.id.toString(), ma_hoc_sinh: item.maHocSinh, ho_ten: item.hoTen, cap_do_hien_tai: item.capDoHienTai, trang_thai: item.trangThai, email: item.email, so_dien_thoai: item.soDienThoai, version: item.version };
  }
}

