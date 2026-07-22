// UPPERCASE ENGLISH COMMENTS PROVIDED FOR DATA TRANSFER STRUCTURES
// ARCHITECTED FOR COMPLIANCE WITH THE DYNAMIC IN-APP UNLOCK INTERFACES

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateFeatureRequestDto {
  @ApiProperty({ example: "FIELD_MANAGER" })
  @IsString()
  @IsNotEmpty()
  requestedRole!: string;

  @ApiProperty({
    example: "Need higher capacity limits for current layout requirements",
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}
