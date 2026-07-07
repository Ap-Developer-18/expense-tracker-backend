import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAccountManagerDto } from "./dto/create-account-manager.dto";
import { UpdateAccountManagerDto } from "./dto/update-account-manager.dto";

@Injectable()
export class AccountManagersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAccountManagerDto, superAdminId: string) {
    const existing = await this.prisma.accountManager.findUnique({
      where: { userName: dto.userName },
    });
    if (existing) {
      throw new ConflictException("userName already taken");
    }

    const hashed = await bcrypt.hash(dto.passcode, 10);

    const created = await this.prisma.accountManager.create({
      data: { ...dto, passcode: hashed, superAdminId },
    });

    return this.sanitize(created);
  }

  async findAll(superAdminId: string) {
    const list = await this.prisma.accountManager.findMany({
      where: { superAdminId },
      orderBy: { createdAt: "desc" },
    });
    return list.map(this.sanitize);
  }

  async findOne(id: string, superAdminId: string) {
    const found = await this.prisma.accountManager.findUnique({
      where: { id },
    });
    if (!found || found.superAdminId !== superAdminId) {
      throw new NotFoundException("Account manager not found");
    }
    return this.sanitize(found);
  }

  async update(id: string, dto: UpdateAccountManagerDto, superAdminId: string) {
    await this.findOne(id, superAdminId);

    const data: any = { ...dto };
    if (dto.passcode) {
      data.passcode = await bcrypt.hash(dto.passcode, 10);
    }

    const updated = await this.prisma.accountManager.update({
      where: { id },
      data,
    });
    return this.sanitize(updated);
  }

  async remove(id: string, superAdminId: string) {
    await this.findOne(id, superAdminId);
    await this.prisma.accountManager.delete({ where: { id } });
    return { message: "Account manager deleted" };
  }

  private sanitize(record: any) {
    const { passcode, ...rest } = record;
    return rest;
  }
}
