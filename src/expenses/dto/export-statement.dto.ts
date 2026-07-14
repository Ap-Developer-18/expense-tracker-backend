import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsOptional } from "class-validator";
import { ExpenseStatus, PaidForCategory } from "@prisma/client";

export class ExportStatementDto {
  @ApiPropertyOptional({ example: "2026-07-01" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: "2026-07-13" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: PaidForCategory,
    isArray: true,
    example: [PaidForCategory.MISCELLANEOUS, PaidForCategory.TRAVEL],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PaidForCategory, { each: true })
  @Type(() => String)
  categories?: PaidForCategory[];

  @ApiPropertyOptional({ enum: ExpenseStatus })
  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;
}
