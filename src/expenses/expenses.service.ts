import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ReviewExpenseDto } from "./dto/review-expense.dto";
import { RespondTransferDto } from "./dto/respond-transfer.dto";
import { Prisma } from "@prisma/client";
import { ExportStatementDto } from "./dto/export-statement.dto";
import { ReimburseFieldManagerDto } from "./dto/reimburse-field-manager.dto";

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpenseDto, fieldManagerId: string) {
    // Rule 1: must be actively assigned to this project right now
    const assignment = await this.prisma.projectFieldManager.findUnique({
      where: {
        projectId_fieldManagerId: {
          projectId: dto.projectId,
          fieldManagerId,
        },
      },
    });

    if (!assignment || !assignment.isActive) {
      throw new ForbiddenException(
        "You are not currently assigned to this project",
      );
    }

    // Rule 2: date must be today or up to 2 days in the past, never future
    const expenseDate = new Date(dto.expenseDate);
    expenseDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    if (expenseDate > today) {
      throw new BadRequestException("Expense date cannot be in the future");
    }
    if (expenseDate < twoDaysAgo) {
      throw new BadRequestException(
        "Expense date cannot be older than 2 days ago",
      );
    }

    // Rule 3: TRANSFER-specific validation
    if (dto.paidFor === "TRANSFER") {
      if (!dto.transferToFieldManagerId) {
        throw new BadRequestException("Select a field manager to transfer to");
      }
      if (dto.transferToFieldManagerId === fieldManagerId) {
        throw new BadRequestException("You cannot transfer to yourself");
      }
      const targetFM = await this.prisma.fieldManager.findUnique({
        where: { id: dto.transferToFieldManagerId },
      });
      if (!targetFM || !targetFM.isActive) {
        throw new BadRequestException(
          "Selected field manager not found or inactive",
        );
      }
    }

    return this.prisma.expense.create({
      data: {
        projectId: dto.projectId,
        fieldManagerId,
        submittedAmount: dto.submittedAmount,
        expenseDate,
        mode: dto.mode,
        receiver: dto.receiver,
        paidFor: dto.paidFor,
        description: dto.description,
        ...(dto.paidFor === "TRANSFER"
          ? {
              transferToFieldManagerId: dto.transferToFieldManagerId,
              transferStatus: "PENDING",
            }
          : {}),
      },
    });
  }

  findByFieldManager(fieldManagerId: string, projectId?: string) {
    return this.prisma.expense.findMany({
      where: { fieldManagerId, ...(projectId ? { projectId } : {}) },
      orderBy: { createdAt: "desc" },
      include: { project: true, transferToFieldManager: true },
    });
  }

  findByProject(projectId: string) {
    return this.prisma.expense.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { fieldManager: true, transferToFieldManager: true },
    });
  }

  findAllForFieldManager(fieldManagerId: string, projectId?: string) {
    return this.prisma.expense.findMany({
      where: { fieldManagerId, ...(projectId ? { projectId } : {}) },
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
        reviewedByAccountManager: true,
        transferToFieldManager: true,
      },
    });
  }

  // Expenses where the current field manager is the RECEIVER of a transfer
  findIncomingTransfers(fieldManagerId: string) {
    return this.prisma.expense.findMany({
      where: { transferToFieldManagerId: fieldManagerId },
      orderBy: { createdAt: "desc" },
      include: { project: true, fieldManager: true },
    });
  }

  async respondToTransfer(
    id: string,
    dto: RespondTransferDto,
    fieldManagerId: string,
  ) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException("Expense not found");

    if (expense.paidFor !== "TRANSFER") {
      throw new BadRequestException("This expense is not a transfer");
    }
    if (expense.transferToFieldManagerId !== fieldManagerId) {
      throw new ForbiddenException("This transfer is not addressed to you");
    }
    if (expense.transferStatus !== "PENDING") {
      throw new BadRequestException(
        "You have already responded to this transfer",
      );
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        transferStatus: dto.accept ? "ACCEPTED" : "REJECTED",
        transferRespondedAt: new Date(),
        // Rejected transfer = whole expense rejected, no need for AM to act
        ...(dto.accept ? {} : { status: "REJECTED" }),
      },
    });
  }

  async review(id: string, dto: ReviewExpenseDto, accountManagerId: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException("Expense not found");

    const isApproving =
      dto.status === "APPROVED" || dto.status === "PARTIALLY_APPROVED";

    if (
      isApproving &&
      expense.paidFor === "TRANSFER" &&
      expense.transferStatus !== "ACCEPTED"
    ) {
      throw new BadRequestException(
        "Field manager has not accepted this transfer yet, cannot approve",
      );
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        status: dto.status,
        approvedAmount: dto.approvedAmount,
        reimbursedAmount: dto.reimbursedAmount,
        reviewedByAccountManagerId: accountManagerId,
      },
    });
  }

  /**
   * Fetches expenses for a project statement export, with optional
   * date range + category filters. Used by both the JSON preview
   * and the PDF generation endpoint so filtering logic is defined once.
   */
  async findForStatement(projectId: string, filters: ExportStatementDto) {
    const where: Prisma.ExpenseWhereInput = { projectId };

    if (filters.startDate || filters.endDate) {
      where.expenseDate = {};
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        where.expenseDate.gte = start;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.expenseDate.lte = end;
      }
    }

    if (filters.categories && filters.categories.length > 0) {
      where.paidFor = { in: filters.categories };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: "asc" },
      include: {
        fieldManager: true,
        transferToFieldManager: true,
        reviewedByAccountManager: true,
        project: true,
      },
    });
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        fieldManager: true,
        transferToFieldManager: true,
        reviewedByAccountManager: true,
        project: true,
      },
    });
    if (!expense) throw new NotFoundException("Expense not found");
    return expense;
  }

  async reimburseFieldManager(
    projectId: string,
    dto: ReimburseFieldManagerDto,
  ) {
    const allExpenses = await this.prisma.expense.findMany({
      where: {
        projectId,
        fieldManagerId: dto.fieldManagerId,
        approvedAmount: { not: null },
      },
      orderBy: { expenseDate: "asc" },
    });

    if (allExpenses.length === 0) {
      throw new BadRequestException(
        "This field manager has no approved expenses on this project yet",
      );
    }

    const pending = allExpenses.filter(
      (e) => (e.approvedAmount ?? 0) - e.reimbursedAmount > 0,
    );

    let remaining = dto.amount;
    const updatedExpenseIds: string[] = [];

    await this.prisma.$transaction(async (tx) => {
      // Step 1: pay off pending dues FIFO (oldest first)
      for (const expense of pending) {
        if (remaining <= 0) break;

        const due = (expense.approvedAmount ?? 0) - expense.reimbursedAmount;
        const applied = Math.min(due, remaining);

        await tx.expense.update({
          where: { id: expense.id },
          data: { reimbursedAmount: expense.reimbursedAmount + applied },
        });

        updatedExpenseIds.push(expense.id);
        remaining -= applied;
      }

      // Step 2: leftover = advance payment, park it on the latest expense
      if (remaining > 0) {
        const latestExpense = allExpenses[allExpenses.length - 1];

        await tx.expense.update({
          where: { id: latestExpense.id },
          data: {
            reimbursedAmount: latestExpense.reimbursedAmount + remaining,
          },
        });

        if (!updatedExpenseIds.includes(latestExpense.id)) {
          updatedExpenseIds.push(latestExpense.id);
        }
      }
    });

    return {
      totalReimbursed: dto.amount,
      updatedExpenseIds,
    };
  }
}
