import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VaiTro } from '@prisma/client';
import { Roles, RolesGuard } from '../auth/roles';
import { CreateHocSinhDto, UpdateHocSinhDto } from './hoc-sinh.dto';
import { HocSinhService } from './hoc-sinh.service';

type AuthRequest = Request & { user: { id: string } };
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hoc-sinh')
export class HocSinhController {
  constructor(private readonly service: HocSinhService) {}
  @Roles(VaiTro.QUAN_TRI_VIEN, VaiTro.NHAN_VIEN) @Get() findAll(@Query('q') q = '', @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, @Query('page_size', new DefaultValuePipe(20), ParseIntPipe) size: number) { return this.service.findAll(q, page, size); }
  @Roles(VaiTro.QUAN_TRI_VIEN, VaiTro.NHAN_VIEN) @Post() create(@Body() dto: CreateHocSinhDto, @Req() req: AuthRequest) { return this.service.create(dto, req.user.id); }
  @Roles(VaiTro.QUAN_TRI_VIEN, VaiTro.NHAN_VIEN) @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateHocSinhDto, @Req() req: AuthRequest) { return this.service.update(id, dto, req.user.id); }
}
