// project-assignments/dto/set-assignment-status.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class SetAssignmentStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive!: boolean;
}
