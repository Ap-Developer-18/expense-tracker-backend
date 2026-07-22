import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class ApproveFeatureRequestDto {
  // The new total limit for this role (not an increment).
  // e.g. if the SuperAdmin currently has 2 field managers and asked for more,
  // sending limit: 10 means they can now have up to 10 field managers total.
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  limit!: number;
}
