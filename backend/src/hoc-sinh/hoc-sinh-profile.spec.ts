import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { CreateHocSinhDto, UpdateHocSinhDto } from './hoc-sinh.dto';
import { HocSinhService } from './hoc-sinh.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Student profile fields', () => {
  it('rejects impossible dates and unsupported gender values', async () => {
    const dto = Object.assign(new UpdateHocSinhDto(), { ngay_sinh: '2024-02-30', gioi_tinh: 'INVALID' });
    const errors = await validate(dto);
    expect(errors.map(error => error.property)).toEqual(expect.arrayContaining(['ngay_sinh', 'gioi_tinh']));
  });

  it('persists and returns profile fields on create and update', async () => {
    const record = { id: 1n, maHocSinh: 'HS01', hoTen: 'Test Student', capDoHienTai: 'N5', trangThai: 'DANG_HOC', email: null, soDienThoai: null, version: 1 };
    const create = jest.fn(async ({ data }) => ({ ...record, ...data }));
    const update = jest.fn(async ({ data }) => ({ ...record, ...data, version: 2 }));
    const tx = { hocSinh: { create, update }, nhatKyThaoTac: { create: jest.fn() } };
    const prisma = { hocSinh: { findUnique: jest.fn().mockResolvedValue(record) }, $transaction: (callback: (client: typeof tx) => unknown) => callback(tx) };
    const service = new HocSinhService(prisma as unknown as PrismaService);
    const fields = { ngay_sinh: '2005-06-15', gioi_tinh: 'NU', dia_chi: '  Test address  ' };
    const created = await service.create(Object.assign(new CreateHocSinhDto(), { ma_hoc_sinh: 'HS01', ho_ten: 'Test Student', cap_do_hien_tai: 'N5', ...fields }), '1');
    expect(created).toMatchObject({ ngay_sinh: '2005-06-15', gioi_tinh: 'NU', dia_chi: 'Test address' });
    const updated = await service.update('1', Object.assign(new UpdateHocSinhDto(), { ...fields, gioi_tinh: null, dia_chi: '' }), '1');
    expect(updated).toMatchObject({ ngay_sinh: '2005-06-15', gioi_tinh: null, dia_chi: '' });
    expect(create.mock.calls[0][0].data.ngaySinh.toISOString()).toBe('2005-06-15T00:00:00.000Z');
    await expect(service.update('1', Object.assign(new UpdateHocSinhDto(), { ngay_sinh: '2999-01-01' }), '1')).rejects.toThrow(BadRequestException);
  });
});
