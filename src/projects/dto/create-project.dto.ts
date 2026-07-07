import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project One' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: '28.7041,77.1025' })
  @IsString()
  @MinLength(1)
  location: string;
}
