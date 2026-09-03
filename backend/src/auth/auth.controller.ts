import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AUTH_COOKIE } from './auth.constants';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './auth.types';
import { readCookie } from './cookie.util';
import { CsrfService } from './csrf.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginRateLimitService } from './login-rate-limit.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly cookies: AuthCookieService, private readonly csrf: CsrfService, private readonly rateLimit: LoginRateLimitService) {}
  @Post('login') async login(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const key = `${request.ip ?? 'unknown'}:${dto.ten_dang_nhap.toLocaleLowerCase('vi')}`; this.rateLimit.check(key);
    const result = await this.auth.login(dto.ten_dang_nhap, dto.mat_khau, dto.remember_me, { ip: request.ip, userAgent: request.header('user-agent') });
    this.rateLimit.clear(key); this.cookies.setTokens(response, result.tokens.accessToken, result.tokens.refreshToken, result.refreshSeconds); return { data: result.data };
  }
  @UseGuards(JwtAuthGuard) @Get('me') me(@Req() request: Request) { const user = request.user as AuthenticatedUser; return this.auth.me(user.id, user.sessionId); }
  @Post('refresh') async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.refresh(readCookie(request, AUTH_COOKIE.refresh) ?? ''); this.cookies.setTokens(response, result.tokens.accessToken, result.tokens.refreshToken, result.refreshSeconds); return { data: result.data };
  }
  @UseGuards(JwtAuthGuard) @Post('logout') @HttpCode(204) async logout(@Body() dto: LogoutDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.csrf.assert(request.header('X-CSRF-Token'), readCookie(request, AUTH_COOKIE.csrf)); const user = request.user as AuthenticatedUser;
    await this.auth.logout(user.id, user.sessionId, dto.thu_hoi_tat_ca_phien); this.cookies.clear(response);
  }
  @Get('csrf-token') csrfToken(@Res({ passthrough: true }) response: Response) { const token = this.csrf.create(); this.cookies.setCsrf(response, token); return { data: { csrf_token: token } }; }
}
