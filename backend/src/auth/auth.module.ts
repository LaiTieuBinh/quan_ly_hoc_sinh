import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles';
import { AuthRepository } from './auth.repository';
import { AuthCookieService } from './auth-cookie.service';
import { CsrfService } from './csrf.service';
import { LoginRateLimitService } from './login-rate-limit.service';

@Module({
  imports: [PassportModule, JwtModule.register({ secret: process.env.JWT_SECRET ?? 'local-development-secret-change-me', signOptions: { expiresIn: '8h' } })],
  controllers: [AuthController], providers: [AuthService, AuthRepository, AuthCookieService, CsrfService, LoginRateLimitService, JwtStrategy, RolesGuard], exports: [JwtModule, RolesGuard],
})
export class AuthModule {}
