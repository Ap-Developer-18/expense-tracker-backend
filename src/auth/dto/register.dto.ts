import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Super Admin" })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: "Acme Constructions Pvt Ltd" })
  @IsString()
  companyName!: string;

  @ApiProperty({ example: "superadmin" })
  @IsString()
  userName!: string;

  @ApiProperty({ example: "superadmin@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "+919876543210" })
  @IsPhoneNumber()
  phone!: string;

  @ApiProperty({ example: "ChangeMe123!" })
  @IsString()
  @MinLength(4)
  passcode!: string;
}
