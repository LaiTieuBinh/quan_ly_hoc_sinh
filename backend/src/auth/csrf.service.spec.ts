import { ForbiddenException } from '@nestjs/common';
import { CsrfService } from './csrf.service';

describe('CsrfService', () => {
  const service = new CsrfService();
  it('chấp nhận token header và cookie giống nhau', () => { const token = service.create(); expect(() => service.assert(token, token)).not.toThrow(); });
  it('từ chối token bị thiếu hoặc khác nhau', () => {
    expect(() => service.assert(undefined, 'cookie')).toThrow(ForbiddenException);
    expect(() => service.assert('header', 'cookie')).toThrow(ForbiddenException);
  });
});
