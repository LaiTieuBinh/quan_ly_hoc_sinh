import { VaiTro } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  sessionId: string;
  ten_dang_nhap: string;
  vai_tro: VaiTro;
}

export interface TokenPayload {
  sub: string;
  sid: string;
  role: VaiTro;
  type: 'access' | 'refresh';
}
