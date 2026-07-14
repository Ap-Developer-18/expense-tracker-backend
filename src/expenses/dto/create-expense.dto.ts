import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from "class-validator";
import { ExpenseMode, PaidForCategory } from "@prisma/client";

export class CreateExpenseDto {
  @ApiProperty()
  @IsUUID()
  projectId!: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1)
  submittedAmount!: number;

  @ApiProperty({ example: "2026-07-08" })
  @IsDateString()
  expenseDate!: string;

  @ApiProperty({ enum: ExpenseMode })
  @IsEnum(ExpenseMode)
  mode!: ExpenseMode;

  @ApiProperty({ example: "Ramesh Kumar" })
  @IsString()
  receiver!: string;

  @ApiProperty({ enum: PaidForCategory })
  @IsEnum(PaidForCategory)
  paidFor!: PaidForCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description:
      "Required when paidFor is TRANSFER — the field manager receiving the money",
  })
  @ValidateIf((o) => o.paidFor === "TRANSFER")
  @IsUUID()
  transferToFieldManagerId?: string;
}
