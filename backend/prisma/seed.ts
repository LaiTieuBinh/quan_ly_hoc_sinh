import { PrismaClient, VaiTro, CapDo, TrangThaiHocSinh } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const password = await argon2.hash('Admin@123');
  await prisma.taiKhoan.upsert({
    where: { tenDangNhap: 'admin' },
    update: {},
    create: { tenDangNhap: 'admin', matKhauMaHoa: password, vaiTro: VaiTro.QUAN_TRI_VIEN },
  });
  const students = [
    ['HS0001', 'Nguyễn Minh Anh', CapDo.N5, 'minhanh@example.com'],
    ['HS0002', 'Trần Gia Huy', CapDo.N4, 'giahuy@example.com'],
    ['HS0003', 'Lê Ngọc Mai', CapDo.N3, 'ngocmai@example.com'],
    ['HS0004', 'Phạm Đức Long', CapDo.N2, 'duclong@example.com'],
    ['HS0005', 'Vũ Khánh Linh', CapDo.N1, 'khanhlinh@example.com'],
  ] as const;
  for (const [maHocSinh, hoTen, capDoHienTai, email] of students) {
    await prisma.hocSinh.upsert({
      where: { maHocSinh }, update: {},
      create: { maHocSinh, hoTen, capDoHienTai, email, trangThai: TrangThaiHocSinh.DANG_HOC },
    });
  }
  const subjects = [['TV', 'Từ vựng'], ['NP', 'Ngữ pháp'], ['NGHE', 'Nghe'], ['NOI', 'Nói'], ['DOC', 'Đọc'], ['VIET', 'Viết'], ['KANJI', 'Kanji']];
  for (const [maMon, tenMon] of subjects) {
    await prisma.monHoc.upsert({ where: { maMon }, update: {}, create: { maMon, tenMon } });
  }
}

main().finally(() => prisma.$disconnect());

