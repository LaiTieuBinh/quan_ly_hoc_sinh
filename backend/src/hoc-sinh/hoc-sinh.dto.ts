import { CapDo, TrangThaiHocSinh } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateHocSinhDto {
  @IsString() @MinLength(2) @MaxLength(30) ma_hoc_sinh!: string;
  @IsString() @MinLength(2) @MaxLength(150) ho_ten!: string;
  @IsEnum(CapDo) cap_do_hien_tai!: CapDo;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() so_dien_thoai?: string;
  @IsOptional() @IsEnum(TrangThaiHocSinh) trang_thai?: TrangThaiHocSinh;
}
export class UpdateHocSinhDto {
  @IsOptional() @IsString() @MinLength(2) ho_ten?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() so_dien_thoai?: string;
  @IsOptional() @IsEnum(TrangThaiHocSinh) trang_thai?: TrangThaiHocSinh;
}

