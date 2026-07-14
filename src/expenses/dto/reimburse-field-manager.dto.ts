import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsUUID, Min } from "class-validator";

export class ReimburseFieldManagerDto {
  @ApiProperty()
  @IsUUID()
  fieldManagerId!: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1)
  amount!: number;
}
