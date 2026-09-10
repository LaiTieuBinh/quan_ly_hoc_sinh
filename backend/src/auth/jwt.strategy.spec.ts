import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './jwt.strategy';
import { TokenPayload } from './auth.types';

describe('JWT session validation', () => {
  const payload: TokenPayload = { sub: '1', sid: '12345678-1234-1234-1234-123456789abc', role: 'QUAN_TRI_VIEN', type: 'access' };
  const findActiveSession = jest.fn();
  const strategy = new JwtStrategy({ findActiveSession } as unknown as AuthRepository);
  beforeEach(() => findActiveSession.mockReset());
  it('uses current database role instead of stale JWT claims', async () => {
    findActiveSession.mockResolvedValue({ taiKhoanId: 1n, taiKhoan: { vaiTro: 'NHAN_VIEN', tenDangNhap: 'staff' } });
    expect(await strategy.validate(payload)).toMatchObject({ vai_tro: 'NHAN_VIEN', ten_dang_nhap: 'staff' });
  });
  it('rejects revoked, expired, locked-account, and wrong-owner sessions', async () => {
    findActiveSession.mockResolvedValue(null);
    await expect(strategy.validate(payload)).rejects.toThrow();
    findActiveSession.mockResolvedValue({ taiKhoanId: 2n });
    await expect(strategy.validate(payload)).rejects.toThrow();
  });
  it('rejects refresh tokens and malformed IDs before querying the database', async () => {
    await expect(strategy.validate({ ...payload, type: 'refresh' })).rejects.toThrow();
    await expect(strategy.validate({ ...payload, sid: 'invalid' })).rejects.toThrow();
    expect(findActiveSession).not.toHaveBeenCalled();
  });
});
