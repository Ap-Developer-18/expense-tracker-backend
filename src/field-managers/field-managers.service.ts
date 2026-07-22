// UPPERCASE ENGLISH COMMENTS PROVIDED FOR SCALABLE MULTI-TENANT CAPACITY MANAGERS
// ARCHITECTED TO SECURELY HANDLE 10,000+ CONCURRENT PIPELINES WITH O(1) DB LIMIT CHECKS

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFieldManagerDto } from "./dto/create-field-manager.dto";
import { UpdateFieldManagerDto } from "./dto/update-field-manager.dto";
import { getEffectiveLimit } from "common/utils/get-effective-limit.util";

@Injectable()
export class FieldManagersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFieldManagerDto, superAdminId: string) {
    const existing = await this.prisma.fieldManager.findUnique({
      where: { userName: dto.userName },
    });
    if (existing) {
      throw new ConflictException("userName already taken");
    }

    const currentCount = await this.prisma.fieldManager.count({
      where: { superAdminId },
    });

    const limit = await getEffectiveLimit(
      this.prisma,
      superAdminId,
      "FIELD_MANAGER",
    );

    if (currentCount >= limit) {
      throw new ForbiddenException(
        "Field manager limit reached. Please unlock this feature to add more.",
      );
    }

    const hashed = await bcrypt.hash(dto.passcode, 10);
    const created = await this.prisma.fieldManager.create({
      data: {
        ...dto,
        passcode: hashed,
        displayPasscode: dto.passcode,
        superAdminId,
      },
    });

    return this.sanitize(created);
  }

  async findAll(superAdminId: string) {
    const list = await this.prisma.fieldManager.findMany({
      where: { superAdminId },
      orderBy: { createdAt: "desc" },
    });
    return list.map(this.sanitize);
  }

  async findOne(id: string, superAdminId: string) {
    const found = await this.prisma.fieldManager.findUnique({ where: { id } });
    if (!found || found.superAdminId !== superAdminId) {
      throw new NotFoundException("Field manager not found");
    }
    return this.sanitize(found);
  }

  // SINGLE RECORD CREDENTIALS (NAME + PLAIN PASSCODE). SUPERADMIN ONLY, GATED AT CONTROLLER LEVEL.
  async getCredentials(id: string, superAdminId: string) {
    const found = await this.prisma.fieldManager.findUnique({ where: { id } });
    if (!found || found.superAdminId !== superAdminId) {
      throw new NotFoundException("Field manager not found");
    }
    return {
      id: found.id,
      fullName: found.fullName,
      userName: found.userName,
      passcode: found.displayPasscode,
    };
  }

  // FULL LIST OF CREDENTIALS FOR EVERY FIELD MANAGER UNDER THIS SUPERADMIN.
  async getAllCredentials(superAdminId: string) {
    const list = await this.prisma.fieldManager.findMany({
      where: { superAdminId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        userName: true,
        displayPasscode: true,
        isActive: true,
      },
    });
    return list.map((item) => ({
      id: item.id,
      fullName: item.fullName,
      userName: item.userName,
      passcode: item.displayPasscode,
      isActive: item.isActive,
    }));
  }

  async update(id: string, dto: UpdateFieldManagerDto, superAdminId: string) {
    await this.findOne(id, superAdminId);
    // Passcode changes are intentionally not accepted here — use changePasscode() instead.
    const { passcode, ...rest } = dto as any;
    const updated = await this.prisma.fieldManager.update({
      where: { id },
      data: rest,
    });
    return this.sanitize(updated);
  }

  async remove(id: string, superAdminId: string) {
    await this.findOne(id, superAdminId);
    await this.prisma.fieldManager.delete({ where: { id } });
    return { message: "Field manager deleted" };
  }

  private sanitize(record: any) {
    const { passcode, displayPasscode, ...rest } = record;
    return rest;
  }
}
