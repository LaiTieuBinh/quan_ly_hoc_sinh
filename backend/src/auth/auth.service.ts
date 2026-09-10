import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { AUTH_ERROR, AUTH_TTL } from './auth.constants';
import { AuthRepository } from './auth.repository';
import { TokenPayload } from './auth.types';

interface RequestContext { ip?: string; userAgent?: string }

@Injectable()
export class AuthService {
  constructor(private readonly repository: AuthRepository, private readonly jwt: JwtService) {}
  async login(username: string, password: string, rememberMe: boolean, context: RequestContext) {
    const account = await this.repository.findAccount(username);
    const passwordValid = account ? await argon2.verify(account.matKhauMaHoa, password).catch(() => false) : false;
    if (!account || account.trangThai !== 'HOAT_DONG' || !passwordValid) {
      await this.repository.logLogin({ accountId: account?.id, username, success: false, ...context });
      throw new UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: AUTH_ERROR.invalidCredentials });
    }
    const sessionId = randomUUID();
    const refreshSeconds = rememberMe ? AUTH_TTL.rememberRefreshSeconds : AUTH_TTL.refreshSeconds;
    const expiresAt = new Date(Date.now() + refreshSeconds * 1000);
    const tokens = await this.issueTokens(account.id, account.vaiTro, sessionId, refreshSeconds);
    await this.repository.createSession({ id: sessionId, accountId: account.id, passwordHash: account.matKhauMaHoa, refreshHash: this.hash(tokens.refreshToken), expiresAt, ...context });
    await this.repository.logLogin({ accountId: account.id, username, success: true, ...context });
    return { data: { tai_khoan_id: account.id.toString(), ten_dang_nhap: account.tenDangNhap, vai_tro: account.vaiTro, phien: { het_han_luc: expiresAt.toISOString(), thoi_luong_phut: Math.floor(refreshSeconds / 60) } }, tokens, refreshSeconds };
  }
  async me(accountId: string, sessionId: string) {
    const session = await this.repository.findActiveSession(sessionId);
    if (!session || session.taiKhoanId.toString() !== accountId) this.sessionExpired();
    const account = await this.repository.findProfile(BigInt(accountId));
    if (!account || account.trangThai !== 'HOAT_DONG') this.sessionExpired();
    const profile = account.giaoVien ? { loai: 'GIAO_VIEN', id: account.giaoVien.id.toString() } : account.hocSinh ? { loai: 'HOC_SINH', id: account.hocSinh.id.toString() } : null;
    return { data: { tai_khoan_id: account.id.toString(), ten_dang_nhap: account.tenDangNhap, vai_tro: account.vaiTro, ho_ten: account.giaoVien?.hoTen ?? account.hocSinh?.hoTen ?? null, ho_so_lien_ket: profile, quyen: this.permissions(account.vaiTro), phien: { het_han_luc: session.hetHanLuc.toISOString() } } };
  }
  async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try { payload = await this.jwt.verifyAsync<TokenPayload>(refreshToken); } catch { return this.sessionExpired(); }
    if (payload.type !== 'refresh') return this.sessionExpired();
    const session = await this.repository.findActiveSession(payload.sid);
    if (!session || session.taiKhoanId.toString() !== payload.sub || session.refreshTokenHash !== this.hash(refreshToken)) return this.sessionExpired();
    const remainingSeconds = Math.max(1, Math.floor((session.hetHanLuc.getTime() - Date.now()) / 1000));
    const tokens = await this.issueTokens(session.taiKhoanId, session.taiKhoan.vaiTro, session.id, remainingSeconds);
    const rotated = await this.repository.rotateSession(session.id, session.refreshTokenHash, this.hash(tokens.refreshToken), session.hetHanLuc);
    if (rotated.count !== 1) return this.sessionExpired();
    return { data: { phien: { het_han_luc: session.hetHanLuc.toISOString() } }, tokens, refreshSeconds: remainingSeconds };
  }
  async logout(accountId: string, sessionId: string, all: boolean) { if (all) await this.repository.revokeAllSessions(BigInt(accountId)); else await this.repository.revokeSession(sessionId); }
  private async issueTokens(accountId: bigint, role: TokenPayload['role'], sessionId: string, refreshSeconds: number) {
    const common = { sub: accountId.toString(), sid: sessionId, role };
    const [accessToken, refreshToken] = await Promise.all([this.jwt.signAsync({ ...common, type: 'access' }, { expiresIn: AUTH_TTL.accessSeconds }), this.jwt.signAsync({ ...common, type: 'refresh' }, { expiresIn: refreshSeconds })]);
    return { accessToken, refreshToken };
  }
  private hash(value: string) { return createHash('sha256').update(value).digest('hex'); }
  private permissions(role: TokenPayload['role']) { return role === 'QUAN_TRI_VIEN' ? ['*'] : ['DASHBOARD_READ']; }
  private sessionExpired(): never { throw new UnauthorizedException({ code: 'SESSION_EXPIRED', message: AUTH_ERROR.sessionExpired }); }
}
