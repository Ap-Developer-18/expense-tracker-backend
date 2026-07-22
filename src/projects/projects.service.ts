// UPPERCASE ENGLISH COMMENTS PROVIDED FOR MULTI-TENANT RESOURCE MANAGEMENT
// SCALABLE ARCHITECTURE ENFORCING O(1) COUNT VERIFICATION LAYERS FOR HIGH CONCURRENCY

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { getEffectiveLimit } from "common/utils/get-effective-limit.util";

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, superAdminId: string) {
    const currentCount = await this.prisma.project.count({
      where: { superAdminId },
    });

    const limit = await getEffectiveLimit(this.prisma, superAdminId, "PROJECT");

    if (currentCount >= limit) {
      throw new ForbiddenException(
        "Project limit reached. Please unlock this feature to add more.",
      );
    }

    return this.prisma.project.create({
      data: {
        ...dto,
        superAdminId,
      },
    });
  }

  async findAll(superAdminId: string) {
    return this.prisma.project.findMany({
      where: { superAdminId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, superAdminId: string) {
    const found = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!found || found.superAdminId !== superAdminId) {
      throw new NotFoundException("Project not found");
    }
    return found;
  }

  async update(id: string, dto: UpdateProjectDto, superAdminId: string) {
    await this.findOne(id, superAdminId);
    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, superAdminId: string) {
    await this.findOne(id, superAdminId);
    await this.prisma.project.delete({
      where: { id },
    });
    return { message: "Project deleted successfully" };
  }
}
