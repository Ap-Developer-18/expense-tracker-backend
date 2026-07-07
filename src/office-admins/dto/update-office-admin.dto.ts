import { PartialType } from '@nestjs/swagger';
import { CreateOfficeAdminDto } from './create-office-admin.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOfficeAdminDto extends PartialType(CreateOfficeAdminDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
