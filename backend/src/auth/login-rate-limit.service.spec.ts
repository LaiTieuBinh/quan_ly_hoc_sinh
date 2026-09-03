import { HttpException } from '@nestjs/common';
import { LoginRateLimitService } from './login-rate-limit.service';

describe('LoginRateLimitService', () => {
  it('chặn lần thử thứ sáu cho cùng một khóa', () => { const service = new LoginRateLimitService(); for (let index = 0; index < 5; index += 1) service.check('ip:user'); expect(() => service.check('ip:user')).toThrow(HttpException); });
  it('xóa bộ đếm sau khi đăng nhập thành công', () => { const service = new LoginRateLimitService(); for (let index = 0; index < 5; index += 1) service.check('ip:user'); service.clear('ip:user'); expect(() => service.check('ip:user')).not.toThrow(); });
});
