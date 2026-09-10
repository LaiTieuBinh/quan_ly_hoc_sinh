import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AUTH_COOKIE } from './auth.constants';
import { readCookie } from './cookie.util';
import { TokenPayload } from './auth.types';
import { AuthRepository } from './auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly repository: AuthRepository) { super({ jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => readCookie(request, AUTH_COOKIE.access) ?? null, ExtractJwt.fromAuthHeaderAsBearerToken()]), ignoreExpiration: false, secretOrKey: process.env.JWT_SECRET ?? 'local-development-secret-change-me' }); }
  async validate(payload: TokenPayload) {
    if (payload.type !== 'access' || typeof payload.sub !== 'string' || !/^[1-9]\d*$/.test(payload.sub) || typeof payload.sid !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.sid)) throw new UnauthorizedException({ code: 'UNAUTHENTICATED', message: 'Phiên đăng nhập không hợp lệ.' });
    const session = await this.repository.findActiveSession(payload.sid);
    if (!session || session.taiKhoanId.toString() !== payload.sub) throw new UnauthorizedException({ code: 'UNAUTHENTICATED', message: 'Phiên đăng nhập đã hết hạn hoặc bị thu hồi.' });
    return { id: payload.sub, sessionId: payload.sid, vai_tro: session.taiKhoan.vaiTro, ten_dang_nhap: session.taiKhoan.tenDangNhap };
  }
}
