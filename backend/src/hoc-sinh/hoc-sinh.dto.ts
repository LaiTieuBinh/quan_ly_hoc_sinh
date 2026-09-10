import { CapDo, TrangThaiHocSinh } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
class StudentProfileDto {
  @IsOptional() @IsDateString({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/) ngay_sinh?: string;
  @IsOptional() @IsIn(['NAM', 'NU', 'KHAC']) gioi_tinh?: string | null;
  @IsOptional() @IsString() @MaxLength(1000) dia_chi?: string;
}
export class CreateHocSinhDto extends StudentProfileDto {
  @IsString() @MinLength(2) @MaxLength(30) ma_hoc_sinh!: string;
  @IsString() @MinLength(2) @MaxLength(150) ho_ten!: string;
  @IsEnum(CapDo) cap_do_hien_tai!: CapDo;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() so_dien_thoai?: string;
  @IsOptional() @IsEnum(TrangThaiHocSinh) trang_thai?: TrangThaiHocSinh;
}
export class UpdateHocSinhDto extends StudentProfileDto {
  @IsOptional() @IsString() @MinLength(2) ho_ten?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() so_dien_thoai?: string;
  @IsOptional() @IsEnum(TrangThaiHocSinh) trang_thai?: TrangThaiHocSinh;
}

