import { PartialType } from '@nestjs/swagger';
import { CreateFieldManagerDto } from './create-field-manager.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFieldManagerDto extends PartialType(CreateFieldManagerDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
