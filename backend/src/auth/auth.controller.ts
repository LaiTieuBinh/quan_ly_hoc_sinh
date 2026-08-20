import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post('login') login(@Body() dto: LoginDto) { return this.service.login(dto.ten_dang_nhap, dto.mat_khau); }
  @UseGuards(JwtAuthGuard) @Get('me') me(@Req() req: Request) { return req.user; }
  @UseGuards(JwtAuthGuard) @Post('logout') logout() { return { success: true }; }
}

