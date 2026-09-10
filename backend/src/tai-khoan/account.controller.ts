import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountAdminGuard } from './account.guard';
import { parseAccount, parseList, parseProfiles, parseStatus, positiveId } from './account.input';
import { AccountService } from './account.service';

@Controller('tai-khoan')
@UseGuards(JwtAuthGuard, AccountAdminGuard)
export class AccountController {
  constructor(private readonly accounts: AccountService) {}
  @Get() list(@Query() query: Record<string, unknown>) { return this.accounts.list(parseList(query)); }
  @Get(':id') detail(@Param('id') id: string) { return this.accounts.detail(positiveId(id)); }
  @Post() create(@Req() req: Request, @Body() body: unknown) { return this.accounts.create(req.user as AuthenticatedUser, parseAccount(body, true)); }
  @Patch(':id') update(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) { return this.accounts.update(req.user as AuthenticatedUser, positiveId(id), parseAccount(body, false)); }
  @Patch(':id/trang-thai') status(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    const input = parseStatus(body);
    return this.accounts.update(req.user as AuthenticatedUser, positiveId(id), { trang_thai: input.trang_thai }, input.ly_do, true);
  }
  @Post(':id/dat-lai-mat-khau') @HttpCode(200)
  reset(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) { return this.accounts.reset(req.user as AuthenticatedUser, positiveId(id), body); }
}

@Controller('ho-so')
@UseGuards(JwtAuthGuard, AccountAdminGuard)
export class AccountProfileController {
  constructor(private readonly accounts: AccountService) {}
  @Get('giao-vien-kha-dung') teachers(@Query() query: Record<string, unknown>) { return this.accounts.profiles('teacher', parseProfiles(query)); }
  @Get('hoc-sinh-kha-dung') students(@Query() query: Record<string, unknown>) { return this.accounts.profiles('student', parseProfiles(query)); }
}
