import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AUTH_COOKIE } from './auth.constants';
import { readCookie } from './cookie.util';
import { TokenPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() { super({ jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => readCookie(request, AUTH_COOKIE.access) ?? null, ExtractJwt.fromAuthHeaderAsBearerToken()]), ignoreExpiration: false, secretOrKey: process.env.JWT_SECRET ?? 'local-development-secret-change-me' }); }
  validate(payload: TokenPayload) { if (payload.type !== 'access') return false; return { id: payload.sub, sessionId: payload.sid, vai_tro: payload.role, ten_dang_nhap: '' }; }
}
