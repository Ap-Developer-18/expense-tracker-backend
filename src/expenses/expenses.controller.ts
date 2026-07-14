import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { ExpensesService } from "./expenses.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ReviewExpenseDto } from "./dto/review-expense.dto";
import { RespondTransferDto } from "./dto/respond-transfer.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtUser } from "src/auth/types/jwt-user.type";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { PaidForCategory } from "@prisma/client";
import { PdfExportService } from "./pdf-export.service";
import { ExportStatementDto } from "./dto/export-statement.dto";
import { ReimburseFieldManagerDto } from "./dto/reimburse-field-manager.dto";

@ApiTags("Expenses")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("expenses")
export class ExpensesController {
  constructor(
    private service: ExpensesService,
    private pdfService: PdfExportService,
    private prisma: PrismaService,
  ) {}

  @Roles("FIELD_MANAGER")
  @Get("my")
  findMine(
    @CurrentUser() user: JwtUser,
    @Query("projectId") projectId?: string,
  ) {
    return this.service.findByFieldManager(user.id, projectId);
  }

  @Roles("FIELD_MANAGER")
  @Get("incoming-transfers")
  incomingTransfers(@CurrentUser() user: JwtUser) {
    return this.service.findIncomingTransfers(user.id);
  }

  @Roles("FIELD_MANAGER")
  @Post()
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto, user.id);
  }

  @Roles("FIELD_MANAGER")
  @Patch(":id/transfer-response")
  respondTransfer(
    @Param("id") id: string,
    @Body() dto: RespondTransferDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.respondToTransfer(id, dto, user.id);
  }

  @Roles("ACCOUNT_MANAGER", "SUPER_ADMIN")
  @Get("project/:projectId")
  findByProject(@Param("projectId") projectId: string) {
    return this.service.findByProject(projectId);
  }

  @Roles("OFFICE_ADMIN")
  @Get("field-manager/:fieldManagerId")
  findByFieldManagerForAdmin(
    @Param("fieldManagerId") fieldManagerId: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.service.findAllForFieldManager(fieldManagerId, projectId);
  }

  @Roles("ACCOUNT_MANAGER")
  @Patch(":id/review")
  review(
    @Param("id") id: string,
    @Body() dto: ReviewExpenseDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.review(id, dto, user.id);
  }

  /**
   * Reimburses a field manager against their oldest pending dues first
   * (FIFO) within a specific project. Called by the "+" reimburse modal
   * on the Account Manager project summary screen.
   */
  @Roles("ACCOUNT_MANAGER", "SUPER_ADMIN")
  @Post("project/:projectId/reimburse")
  reimburse(
    @Param("projectId") projectId: string,
    @Body() dto: ReimburseFieldManagerDto,
  ) {
    return this.service.reimburseFieldManager(projectId, dto);
  }

  /**
   * Preview statement data as JSON (used by the frontend to show
   * a filtered list before generating/sharing the PDF).
   * Query: ?startDate=2026-07-01&endDate=2026-07-13&categories=TRAVEL,GST_INVOICE&status=APPROVED
   */
  @Roles("ACCOUNT_MANAGER", "SUPER_ADMIN")
  @Get("project/:projectId/statement")
  async getStatement(
    @Param("projectId") projectId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("categories") categories?: string,
    @Query("status") status?: string,
  ) {
    const dto = this.parseStatementQuery(
      startDate,
      endDate,
      categories,
      status,
    );
    return this.service.findForStatement(projectId, dto);
  }

  /**
   * Generates and streams a PDF statement for a project, with the
   * same filters as the JSON preview above.
   */
  @Roles("ACCOUNT_MANAGER", "SUPER_ADMIN")
  @Get("project/:projectId/statement/pdf")
  async getStatementPdf(
    @Param("projectId") projectId: string,
    @Query("startDate") startDate: string | undefined,
    @Query("endDate") endDate: string | undefined,
    @Query("categories") categories: string | undefined,
    @Query("status") status: string | undefined,
    @Res() res: Response,
  ) {
    const dto = this.parseStatementQuery(
      startDate,
      endDate,
      categories,
      status,
    );

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException("Project not found");

    const expenses = await this.service.findForStatement(projectId, dto);
    const pdfBuffer = await this.pdfService.generateStatement({
      projectName: project.name,
      expenses,
      filters: { startDate, endDate, categories: dto.categories },
    });

    const filename = `statement-${project.name.replace(/\s+/g, "_")}-${Date.now()}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Roles("ACCOUNT_MANAGER", "SUPER_ADMIN", "FIELD_MANAGER")
  @Get(":id/bill/pdf")
  async getExpenseBillPdf(@Param("id") id: string, @Res() res: Response) {
    const expense = await this.service.findOne(id);
    const pdfBuffer = await this.pdfService.generateExpenseBill(expense);

    const filename = `bill-${expense.id.slice(0, 8)}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  private parseStatementQuery(
    startDate?: string,
    endDate?: string,
    categories?: string,
    status?: string,
  ): ExportStatementDto {
    const dto = new ExportStatementDto();
    if (startDate) dto.startDate = startDate;
    if (endDate) dto.endDate = endDate;
    if (status) dto.status = status as any;
    if (categories) {
      dto.categories = categories
        .split(",")
        .map((c) => c.trim())
        .filter((c): c is PaidForCategory =>
          Object.values(PaidForCategory).includes(c as PaidForCategory),
        );
    }
    return dto;
  }
}
