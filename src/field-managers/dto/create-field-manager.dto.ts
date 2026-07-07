import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateFieldManagerDto {
  @ApiProperty({ example: "Rahul Sharma" })
  @IsString()
  @MinLength(3)
  fullName!: string;

  @ApiProperty({ example: "rahul.sharma" })
  @IsString()
  @MinLength(1)
  userName!: string;

  @ApiProperty({ example: "1234" })
  @IsString()
  @MinLength(4)
  passcode!: string;
}
