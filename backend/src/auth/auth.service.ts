import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async login(username: string, password: string) {
    const account = await this.prisma.taiKhoan.findUnique({ where: { tenDangNhap: username } });
    if (!account || account.trangThai !== 'HOAT_DONG' || !(await argon2.verify(account.matKhauMaHoa, password))) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
    const user = { id: account.id.toString(), ten_dang_nhap: account.tenDangNhap, vai_tro: account.vaiTro };
    return { access_token: await this.jwt.signAsync({ sub: user.id, role: user.vai_tro }), user };
  }
}

