import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AssignAccountManagerDto {
  @ApiProperty()
  @IsUUID()
  accountManagerId!: string;
}
