// project-assignments/project-assignments.service.ts
import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProjectAssignmentsService {
  constructor(private prisma: PrismaService) {}

  getAssignments(projectId: string) {
    return this.prisma
      .$transaction([
        this.prisma.projectFieldManager.findMany({
          where: { projectId },
          include: { fieldManager: true },
        }),
        this.prisma.projectAccountManager.findMany({
          where: { projectId },
          include: { accountManager: true },
        }),
      ])
      .then(([fieldManagers, accountManagers]) => ({
        fieldManagers,
        accountManagers,
      }));
  }

  getActiveFieldManagersForProject(projectId: string) {
    return this.prisma.projectFieldManager
      .findMany({
        where: {
          projectId,
          isActive: true,
          fieldManager: { isActive: true },
        },
        include: { fieldManager: true },
      })
      .then((assignments) => assignments.map((a) => a.fieldManager));
  }

  async assignFieldManager(projectId: string, fieldManagerId: string) {
    const existing = await this.prisma.projectFieldManager.findUnique({
      where: { projectId_fieldManagerId: { projectId, fieldManagerId } },
    });
    if (existing) throw new ConflictException("Already assigned");

    return this.prisma.projectFieldManager.create({
      data: { projectId, fieldManagerId },
    });
  }

  getProjectsForAccountManager(accountManagerId: string) {
    return this.prisma.projectAccountManager.findMany({
      where: { accountManagerId },
      include: { project: true },
    });
  }

  getProjectsForFieldManager(fieldManagerId: string) {
    return this.prisma.projectFieldManager.findMany({
      where: { fieldManagerId },
      include: { project: true },
    });
  }

  unassignFieldManager(projectId: string, fieldManagerId: string) {
    return this.prisma.projectFieldManager.delete({
      where: { projectId_fieldManagerId: { projectId, fieldManagerId } },
    });
  }

  async assignAccountManager(projectId: string, accountManagerId: string) {
    const existing = await this.prisma.projectAccountManager.findUnique({
      where: { projectId_accountManagerId: { projectId, accountManagerId } },
    });
    if (existing) throw new ConflictException("Already assigned");

    return this.prisma.projectAccountManager.create({
      data: { projectId, accountManagerId },
    });
  }

  unassignAccountManager(projectId: string, accountManagerId: string) {
    return this.prisma.projectAccountManager.delete({
      where: { projectId_accountManagerId: { projectId, accountManagerId } },
    });
  }

  setFieldManagerStatus(
    projectId: string,
    fieldManagerId: string,
    isActive: boolean,
  ) {
    return this.prisma.projectFieldManager.update({
      where: { projectId_fieldManagerId: { projectId, fieldManagerId } },
      data: { isActive },
    });
  }

  setAccountManagerStatus(
    projectId: string,
    accountManagerId: string,
    isActive: boolean,
  ) {
    return this.prisma.projectAccountManager.update({
      where: { projectId_accountManagerId: { projectId, accountManagerId } },
      data: { isActive },
    });
  }
}
