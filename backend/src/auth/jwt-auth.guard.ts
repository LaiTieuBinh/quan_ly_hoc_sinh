import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(error: unknown, user: TUser): TUser {
    if (error) throw error;
    if (!user) throw new UnauthorizedException({ code: 'UNAUTHENTICATED', message: 'Vui lòng đăng nhập bằng phiên hợp lệ.' });
    return user;
  }
}

