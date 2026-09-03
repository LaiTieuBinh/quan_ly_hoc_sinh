import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AUTH_COOKIE, AUTH_TTL } from './auth.constants';

@Injectable()
export class AuthCookieService {
  private readonly secure = process.env.NODE_ENV === 'production';

  setTokens(response: Response, accessToken: string, refreshToken: string, refreshSeconds: number) {
    response.cookie(AUTH_COOKIE.access, accessToken, this.options(AUTH_TTL.accessSeconds, '/api/v1'));
    response.cookie(AUTH_COOKIE.refresh, refreshToken, this.options(refreshSeconds, '/api/v1/auth'));
  }

  setCsrf(response: Response, token: string) {
    response.cookie(AUTH_COOKIE.csrf, token, { ...this.options(AUTH_TTL.csrfSeconds, '/api/v1'), httpOnly: false });
  }

  clear(response: Response) {
    response.clearCookie(AUTH_COOKIE.access, this.clearOptions('/api/v1'));
    response.clearCookie(AUTH_COOKIE.refresh, this.clearOptions('/api/v1/auth'));
  }

  private options(maxAgeSeconds: number, path: string) {
    return { httpOnly: true, secure: this.secure, sameSite: 'lax' as const, path, maxAge: maxAgeSeconds * 1000 };
  }

  private clearOptions(path: string) {
    return { httpOnly: true, secure: this.secure, sameSite: 'lax' as const, path };
  }
}
