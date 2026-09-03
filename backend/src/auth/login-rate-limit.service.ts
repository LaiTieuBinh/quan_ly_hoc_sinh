import { HttpException, Injectable } from '@nestjs/common';
@Injectable()
export class LoginRateLimitService {
  private readonly attempts = new Map<string, { count: number; resetAt: number }>();
  private readonly limit = 5; private readonly windowMs = 15 * 60 * 1000;
  check(key: string) { const now = Date.now(); const current = this.attempts.get(key); if (!current || current.resetAt <= now) { this.attempts.set(key, { count: 1, resetAt: now + this.windowMs }); return; } current.count += 1; if (current.count > this.limit) throw new HttpException({ code: 'LOGIN_RATE_LIMITED', message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.', retryAfter: Math.ceil((current.resetAt - now) / 1000) }, 429); }
  clear(key: string) { this.attempts.delete(key); }
}
