import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "superadmin" })
  @IsString()
  userName!: string;

  @ApiProperty({ example: "ChangeMe123!" })
  @IsString()
  @MinLength(4)
  passcode!: string;
}
