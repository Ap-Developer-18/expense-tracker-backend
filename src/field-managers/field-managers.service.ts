// field-managers.service.ts — same as before, structure unchanged, just confirming
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFieldManagerDto } from "./dto/create-field-manager.dto";
import { UpdateFieldManagerDto } from "./dto/update-field-manager.dto";

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

    const hashed = await bcrypt.hash(dto.passcode, 10);

    const created = await this.prisma.fieldManager.create({
      data: { ...dto, passcode: hashed, superAdminId },
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

  async update(id: string, dto: UpdateFieldManagerDto, superAdminId: string) {
    await this.findOne(id, superAdminId);

    const data: any = { ...dto };
    if (dto.passcode) {
      data.passcode = await bcrypt.hash(dto.passcode, 10);
    }

    const updated = await this.prisma.fieldManager.update({
      where: { id },
      data,
    });
    return this.sanitize(updated);
  }

  async remove(id: string, superAdminId: string) {
    await this.findOne(id, superAdminId);
    await this.prisma.fieldManager.delete({ where: { id } });
    return { message: "Field manager deleted" };
  }

  private sanitize(record: any) {
    const { passcode, ...rest } = record;
    return rest;
  }
}
