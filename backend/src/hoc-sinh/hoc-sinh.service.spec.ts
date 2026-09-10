import { BadRequestException } from '@nestjs/common';
import { CapDo, TrangThaiHocSinh } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HocSinhController } from './hoc-sinh.controller';
import { HocSinhService } from './hoc-sinh.service';

 describe('Student list filters and pagination', () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(42);
  const prisma = { hocSinh: { findMany, count }, $transaction: (queries: Promise<unknown>[]) => Promise.all(queries) };
  const service = new HocSinhService(prisma as unknown as PrismaService);
  const controller = new HocSinhController(service);
  beforeEach(() => jest.clearAllMocks());

  it('combines search, status and level before pagination and counts the same result set', async () => {
    const result = await controller.findAll('  Anh  ', 2, 20, 'DANG_HOC', 'N4');
    const query = findMany.mock.calls[0][0];
    expect(query).toMatchObject({ skip: 20, take: 20, where: { trangThai: TrangThaiHocSinh.DANG_HOC, capDoHienTai: CapDo.N4, OR: [{ maHocSinh: { contains: 'Anh' } }, { hoTen: { contains: 'Anh' } }] } });
    expect(count).toHaveBeenCalledWith({ where: query.where });
    expect(result.meta).toEqual({ page: 2, page_size: 20, total: 42, total_pages: 3 });
  });

  it('rejects invalid filter values without querying data', () => {
    expect(() => controller.findAll('', 1, 20, 'INVALID', '')).toThrow(BadRequestException);
    expect(() => controller.findAll('', 1, 20, '', 'N6')).toThrow(BadRequestException);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('keeps pagination metadata consistent with the effective page size', async () => {
    const result = await controller.findAll('', -1, 200, '', '');
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 100, where: {} }));
    expect(result.meta).toEqual({ page: 1, page_size: 100, total: 42, total_pages: 1 });
  });
});
