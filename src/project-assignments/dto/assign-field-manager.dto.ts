// project-assignments/dto/assign-field-manager.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AssignFieldManagerDto {
  @ApiProperty()
  @IsUUID()
  fieldManagerId!: string;
}
