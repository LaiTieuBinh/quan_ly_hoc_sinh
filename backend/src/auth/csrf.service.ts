import { ForbiddenException, Injectable } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'crypto';
@Injectable()
export class CsrfService {
  create() { return randomBytes(32).toString('base64url'); }
  assert(headerToken?: string, cookieToken?: string) { if (!headerToken || !cookieToken) this.invalid(); const header = Buffer.from(headerToken); const cookie = Buffer.from(cookieToken); if (header.length !== cookie.length || !timingSafeEqual(header, cookie)) this.invalid(); }
  private invalid(): never { throw new ForbiddenException({ code: 'CSRF_INVALID', message: 'Mã bảo vệ yêu cầu không hợp lệ.' }); }
}
