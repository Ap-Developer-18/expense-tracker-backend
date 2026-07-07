import { PartialType } from '@nestjs/swagger';
import { CreateAccountManagerDto } from './create-account-manager.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountManagerDto extends PartialType(CreateAccountManagerDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
