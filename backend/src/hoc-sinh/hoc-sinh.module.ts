import { Module } from '@nestjs/common';
import { HocSinhController } from './hoc-sinh.controller';
import { HocSinhService } from './hoc-sinh.service';
@Module({ controllers: [HocSinhController], providers: [HocSinhService] })
export class HocSinhModule {}

