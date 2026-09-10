import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CsrfService } from '../auth/csrf.service';
import { AccountController, AccountProfileController } from './account.controller';
import { AccountAdminGuard } from './account.guard';
import { AccountService } from './account.service';

@Module({ imports: [AuthModule], controllers: [AccountController, AccountProfileController], providers: [AccountService, AccountAdminGuard, CsrfService] })
export class AccountModule {}
