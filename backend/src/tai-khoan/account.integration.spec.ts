import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, VaiTro } from '@prisma/client';
import { execFileSync } from 'child_process';
import { randomUUID } from 'crypto';
import { resolve } from 'path';
import * as argon2 from 'argon2';
import { AppModule } from '../app.module';
import { ApiExceptionFilter } from '../shared/api-exception.filter';
import { AUTH_COOKIE } from '../auth/auth.constants';

// Opt in with a local PostgreSQL URL. Every run creates and drops its own schema.
const databaseUrl = process.env.ACCOUNT_TEST_DATABASE_URL;
const integration = databaseUrl ? describe : describe.skip;
integration('Account API with PostgreSQL', () => {
  jest.setTimeout(90000);
  let app: INestApplication;
  let db: PrismaClient;
  let base: string;
  let jwt: JwtService;
  let admin: { id: bigint; token: string };
  let staff: { id: bigint; token: string };
  let teacherId: number;
  let studentId: number;
  let hash: string;
  const originalUrl = process.env.DATABASE_URL;
  const schema = `account_api_test_${randomUUID().replace(/-/g, '')}`;
  const secret = 'Integration-password-2026';

  async function session(id: bigint, role: VaiTro) {
    const sid = randomUUID();
    await db.phienDangNhap.create({ data: { id: sid, taiKhoanId: id, refreshTokenHash: '0'.repeat(64), hetHanLuc: new Date(Date.now() + 3600000) } });
    return jwt.sign({ sub: String(id), sid, role, type: 'access' });
  }
  async function call(method: string, path: string, body?: unknown, token = admin.token, headers: Record<string, string> = {}) {
    const response = await fetch(`${base}/api/v1${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json(), headers: response.headers };
  }
  beforeAll(async () => {
    const url = new URL(databaseUrl!);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Integration tests require a local PostgreSQL server.');
    url.searchParams.set('schema', schema);
    process.env.DATABASE_URL = url.toString();
    execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy', '--schema', resolve(__dirname, '../../prisma/schema.prisma')], { env: { ...process.env }, stdio: 'pipe' });
    db = new PrismaClient({ datasourceUrl: url.toString() });
    await db.$connect();
    hash = await argon2.hash(secret, { type: argon2.argon2id });
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.listen(0, '127.0.0.1');
    base = await app.getUrl(); jwt = app.get(JwtService);
  });
  beforeEach(async () => {
    await db.nhatKyThaoTac.deleteMany(); await db.nhatKyDangNhap.deleteMany(); await db.phienDangNhap.deleteMany();
    await db.giaoVien.deleteMany(); await db.hocSinh.deleteMany(); await db.taiKhoan.deleteMany();
    const a = await db.taiKhoan.create({ data: { tenDangNhap: 'admin', matKhauMaHoa: hash, vaiTro: 'QUAN_TRI_VIEN' } });
    const s = await db.taiKhoan.create({ data: { tenDangNhap: 'staff', matKhauMaHoa: hash, vaiTro: 'NHAN_VIEN' } });
    admin = { id: a.id, token: await session(a.id, a.vaiTro) }; staff = { id: s.id, token: await session(s.id, s.vaiTro) };
    teacherId = Number((await db.giaoVien.create({ data: { maGiaoVien: 'GV001', hoTen: 'Nguyễn Văn A', capDoGiangDay: [] } })).id);
    studentId = Number((await db.hocSinh.create({ data: { maHocSinh: 'HS001', hoTen: 'Trần Minh Anh', capDoHienTai: 'N5' } })).id);
  });
  afterAll(async () => {
    await app?.close();
    if (db && /^account_api_test_[a-f0-9]+$/.test(schema)) {
      await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await db.$disconnect();
    }
    if (originalUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = originalUrl;
  });

  it('rejects unauthenticated/non-admin requests to all endpoints', async () => {
    expect((await call('GET', '/tai-khoan', undefined, '')).status).toBe(401);
    for (const role of ['NHAN_VIEN', 'GIAO_VIEN', 'HOC_SINH'] as const) {
      await db.taiKhoan.update({ where: { id: staff.id }, data: { vaiTro: role } });
      for (const [method, path] of [['GET', '/tai-khoan'], ['GET', `/tai-khoan/${admin.id}`], ['POST', '/tai-khoan'], ['PATCH', `/tai-khoan/${admin.id}`], ['PATCH', `/tai-khoan/${admin.id}/trang-thai`], ['POST', `/tai-khoan/${admin.id}/dat-lai-mat-khau`], ['GET', '/ho-so/giao-vien-kha-dung'], ['GET', '/ho-so/hoc-sinh-kha-dung']]) {
        const response = await call(method, path, undefined, staff.token);
        expect(response.status).toBe(403); expect(response.body.error.code).toBe('ADMIN_REQUIRED');
      }
    }
  });
  it('filters case-insensitively, paginates, and never returns secrets', async () => {
    await db.taiKhoan.createMany({ data: Array.from({ length: 23 }, (_, i) => ({ tenDangNhap: `member${i}`, matKhauMaHoa: hash, vaiTro: 'NHAN_VIEN' as const })) });
    const response = await call('GET', '/tai-khoan?q=%20MEMBER%20&vai_tro=NHAN_VIEN&page=2');
    expect(response.status).toBe(200); expect(response.body.data).toHaveLength(3);
    expect(response.body.meta).toEqual({ page: 2, page_size: 20, total: 23, total_pages: 2 });
    expect(JSON.stringify(response.body)).not.toMatch(/mat_khau|argon2|token/i);
    expect((await call('GET', '/tai-khoan?page_size=101')).body.error.code).toBe('INVALID_QUERY');
  });
  it('creates safe accounts, hashes passwords and rejects normalized duplicates', async () => {
    const input = { ten_dang_nhap: '  Teacher.New  ', mat_khau: secret, vai_tro: 'GIAO_VIEN', giao_vien_id: teacherId };
    const response = await call('POST', '/tai-khoan', input);
    expect(response.status).toBe(201); expect(response.body.data.ho_so_lien_ket.id).toBe(teacherId);
    const saved = await db.taiKhoan.findUniqueOrThrow({ where: { id: BigInt(response.body.data.id) } });
    expect(await argon2.verify(saved.matKhauMaHoa, secret)).toBe(true);
    const duplicate = await call('POST', '/tai-khoan', { ...input, ten_dang_nhap: 'teacher.new' });
    expect(duplicate.status).toBe(409); expect(duplicate.body.error.code).toBe('USERNAME_ALREADY_EXISTS');
    const audit = await db.nhatKyThaoTac.findMany();
    const safe = JSON.stringify(audit, (_, v) => typeof v === 'bigint' ? String(v) : v);
    expect(safe).not.toContain(secret); expect(safe).not.toContain(saved.matKhauMaHoa);
  });
  it('validates role/profile links and prevents concurrent profile assignment', async () => {
    expect((await call('POST', '/tai-khoan', { ten_dang_nhap: 'teacher', mat_khau: secret, vai_tro: 'GIAO_VIEN' })).status).toBe(422);
    expect((await call('POST', '/tai-khoan', { ten_dang_nhap: 'teacher', mat_khau: secret, vai_tro: 'GIAO_VIEN', hoc_sinh_id: studentId })).status).toBe(422);
    const results = await Promise.all(['one', 'two'].map(name => call('POST', '/tai-khoan', { ten_dang_nhap: name, mat_khau: secret, vai_tro: 'GIAO_VIEN', giao_vien_id: teacherId })));
    expect(results.map(r => r.status).sort()).toEqual([201, 409]);
    const winner = results.find(r => r.status === 201)!.body.data.id;
    expect((await call('GET', '/ho-so/giao-vien-kha-dung')).body.data).toHaveLength(0);
    expect((await call('GET', `/ho-so/giao-vien-kha-dung?tai_khoan_id=${winner}`)).body.data).toHaveLength(1);
    expect((await call('PATCH', `/tai-khoan/${winner}`, { vai_tro: 'NHAN_VIEN' })).status).toBe(422);
    expect((await call('PATCH', `/tai-khoan/${winner}`, { vai_tro: 'NHAN_VIEN', giao_vien_id: null, hoc_sinh_id: null })).status).toBe(200);
    expect((await call('GET', '/ho-so/giao-vien-kha-dung')).body.data).toHaveLength(1);
  });
  it('locks, revokes access immediately, and requires new login after unlock', async () => {
    expect((await call('PATCH', `/tai-khoan/${staff.id}/trang-thai`, { trang_thai: 'KHOA' })).body.data.trang_thai).toBe('KHOA');
    expect((await call('GET', '/auth/me', undefined, staff.token)).status).toBe(401);
    expect((await call('POST', '/auth/login', { ten_dang_nhap: 'staff', mat_khau: secret, remember_me: false }, '')).status).toBe(401);
    expect((await call('PATCH', `/tai-khoan/${staff.id}/trang-thai`, { trang_thai: 'HOAT_DONG' })).status).toBe(200);
    expect((await call('GET', '/auth/me', undefined, staff.token)).status).toBe(401);
    expect((await call('POST', '/auth/login', { ten_dang_nhap: 'STAFF', mat_khau: secret, remember_me: false }, '')).status).toBe(201);
  });
  it('protects the last active admin, including simultaneous self-locks and demotion', async () => {
    expect((await call('PATCH', `/tai-khoan/${admin.id}`, { vai_tro: 'NHAN_VIEN', giao_vien_id: null, hoc_sinh_id: null })).body.error.code).toBe('LAST_ACTIVE_ADMIN');
    await db.taiKhoan.update({ where: { id: staff.id }, data: { vaiTro: 'QUAN_TRI_VIEN' } });
    const results = await Promise.all([call('PATCH', `/tai-khoan/${admin.id}/trang-thai`, { trang_thai: 'KHOA' }), call('PATCH', `/tai-khoan/${staff.id}/trang-thai`, { trang_thai: 'KHOA' }, staff.token)]);
    expect(results.map(r => r.status).sort()).toEqual([200, 409]);
    expect(await db.taiKhoan.count({ where: { vaiTro: 'QUAN_TRI_VIEN', trangThai: 'HOAT_DONG' } })).toBe(1);
  });
  it('resets passwords, revokes sessions by default and limits invalid attempts', async () => {
    const next = 'Replacement-password-2026';
    const response = await call('POST', `/tai-khoan/${staff.id}/dat-lai-mat-khau`, { mat_khau_moi: next, xac_nhan_mat_khau: next });
    expect(response.status).toBe(200); expect(Object.keys(response.body.data).sort()).toEqual(['dat_lai_luc', 'tai_khoan_id']);
    expect((await call('GET', '/auth/me', undefined, staff.token)).status).toBe(401);
    expect(await argon2.verify((await db.taiKhoan.findUniqueOrThrow({ where: { id: staff.id } })).matKhauMaHoa, next)).toBe(true);
    expect((await call('POST', '/auth/login', { ten_dang_nhap: 'staff', mat_khau: secret, remember_me: false }, '')).status).toBe(401);
    expect((await call('POST', '/auth/login', { ten_dang_nhap: 'staff', mat_khau: next, remember_me: false }, '')).status).toBe(201);
    for (let i = 0; i < 4; i++) expect((await call('POST', `/tai-khoan/${staff.id}/dat-lai-mat-khau`, { mat_khau_moi: 'invalid' })).status).toBe(422);
    expect((await call('POST', `/tai-khoan/${staff.id}/dat-lai-mat-khau`, {})).status).toBe(429);
    const logs = JSON.stringify(await db.nhatKyThaoTac.findMany(), (_, v) => typeof v === 'bigint' ? String(v) : v);
    expect(logs).not.toContain(next); expect(logs).not.toContain('invalid'); expect(logs).not.toContain('argon2');
  });
  it('supports opting out of session revocation on reset', async () => {
    const response = await call('POST', `/tai-khoan/${staff.id}/dat-lai-mat-khau`, { mat_khau_moi: secret, xac_nhan_mat_khau: secret, thu_hoi_phien_hien_tai: false });
    expect(response.status).toBe(200); expect((await call('GET', '/auth/me', undefined, staff.token)).status).toBe(200);
  });
  it('requires CSRF for cookie-authenticated writes and permits matching tokens', async () => {
    const cookie = `${AUTH_COOKIE.access}=${admin.token}; ${AUTH_COOKIE.csrf}=example-csrf-token`;
    expect((await call('PATCH', `/tai-khoan/${staff.id}/trang-thai`, { trang_thai: 'KHOA' }, '', { Cookie: cookie })).body.error.code).toBe('CSRF_INVALID');
    expect((await call('PATCH', `/tai-khoan/${staff.id}/trang-thai`, { trang_thai: 'KHOA' }, '', { Cookie: cookie, 'X-CSRF-Token': 'example-csrf-token' })).status).toBe(200);
  });
  it('returns profile search results, explicit inactive selections, and safe 404/422 errors', async () => {
    expect((await call('GET', '/ho-so/hoc-sinh-kha-dung?q=HS001')).body.data[0].id).toBe(studentId);
    await db.hocSinh.update({ where: { id: BigInt(studentId) }, data: { trangThai: 'NGHI_HOC' } });
    expect((await call('GET', '/ho-so/hoc-sinh-kha-dung')).body.data).toHaveLength(0);
    expect((await call('GET', '/ho-so/hoc-sinh-kha-dung?include_inactive=true')).body.data).toHaveLength(1);
    expect((await call('GET', '/tai-khoan/99999999')).body.error.code).toBe('ACCOUNT_NOT_FOUND');
    expect((await call('PATCH', `/tai-khoan/${staff.id}`, { mat_khau: secret })).status).toBe(422);
  });
});
