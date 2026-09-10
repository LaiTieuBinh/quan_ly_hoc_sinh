import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { AUTH_COOKIE } from '../auth/auth.constants';
import { readCookie } from '../auth/cookie.util';
import { CsrfService } from '../auth/csrf.service';
import { Request } from 'express';
import { fail } from './account.input';

@Injectable()
export class AccountAdminGuard implements CanActivate {
  constructor(private readonly csrf: CsrfService) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) fail(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập.');
    if (user.vai_tro !== 'QUAN_TRI_VIEN') fail(403, 'ADMIN_REQUIRED', 'Chỉ quản trị viên được quản lý tài khoản.');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && readCookie(request, AUTH_COOKIE.access)) this.csrf.assert(request.header('X-CSRF-Token'), readCookie(request, AUTH_COOKIE.csrf));
    return true;
  }
}
