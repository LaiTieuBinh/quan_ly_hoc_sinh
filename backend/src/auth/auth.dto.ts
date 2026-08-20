import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @IsString() ten_dang_nhap!: string;
  @IsString() @MinLength(6) mat_khau!: string;
  @IsOptional() @IsBoolean() remember_me?: boolean;
}

