// expenses/dto/review-expense.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, Min } from "class-validator";
import { ExpenseStatus } from "@prisma/client";

export class ReviewExpenseDto {
  @ApiProperty({ enum: ExpenseStatus })
  @IsEnum(ExpenseStatus)
  status!: ExpenseStatus;

  @ApiProperty({ example: 4000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @ApiProperty({ example: 2000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reimbursedAmount?: number;
}
