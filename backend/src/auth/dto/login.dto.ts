import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString({ message: 'Vui lòng nhập tên đăng nhập.' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên đăng nhập.' })
  @MaxLength(100)
  ten_dang_nhap!: string;

  @IsString({ message: 'Vui lòng nhập mật khẩu.' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu.' })
  @MaxLength(512)
  mat_khau!: string;

  @IsOptional()
  @IsBoolean()
  remember_me = false;
}
