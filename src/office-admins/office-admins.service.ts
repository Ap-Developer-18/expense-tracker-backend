// office-admins.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOfficeAdminDto } from "./dto/create-office-admin.dto";
import { UpdateOfficeAdminDto } from "./dto/update-office-admin.dto";

@Injectable()
export class OfficeAdminsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOfficeAdminDto, superAdminId: string) {
    const existing = await this.prisma.officeAdmin.findUnique({
      where: { userName: dto.userName },
    });
    if (existing) {
      throw new ConflictException("userName already taken");
    }

    const hashed = await bcrypt.hash(dto.passcode, 10);

    const created = await this.prisma.officeAdmin.create({
      data: { ...dto, passcode: hashed, superAdminId },
    });

    return this.sanitize(created);
  }

  async findAll(superAdminId: string) {
    const list = await this.prisma.officeAdmin.findMany({
      where: { superAdminId },
      orderBy: { createdAt: "desc" },
    });
    return list.map(this.sanitize);
  }

  async findOne(id: string, superAdminId: string) {
    const found = await this.prisma.officeAdmin.findUnique({ where: { id } });
    if (!found || found.superAdminId !== superAdminId) {
      throw new NotFoundException("Office admin not found");
    }
    return this.sanitize(found);
  }

  async update(id: string, dto: UpdateOfficeAdminDto, superAdminId: string) {
    await this.findOne(id, superAdminId);

    const data: any = { ...dto };
    if (dto.passcode) {
      data.passcode = await bcrypt.hash(dto.passcode, 10);
    }

    const updated = await this.prisma.officeAdmin.update({
      where: { id },
      data,
    });
    return this.sanitize(updated);
  }

  async remove(id: string, superAdminId: string) {
    await this.findOne(id, superAdminId);
    await this.prisma.officeAdmin.delete({ where: { id } });
    return { message: "Office admin deleted" };
  }

  private sanitize(record: any) {
    const { passcode, ...rest } = record;
    return rest;
  }
}
