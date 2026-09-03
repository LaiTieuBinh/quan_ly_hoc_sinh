import { IsBoolean, IsOptional } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  @IsBoolean()
  thu_hoi_tat_ca_phien = false;
}
