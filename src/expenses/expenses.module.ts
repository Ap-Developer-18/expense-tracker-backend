// expenses/expenses.module.ts
import { Module } from "@nestjs/common";
import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";
import { PdfExportService } from "./pdf-export.service";

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService, PdfExportService],
})
export class ExpensesModule {}
