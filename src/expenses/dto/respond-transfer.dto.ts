import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class RespondTransferDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  accept!: boolean;
}
