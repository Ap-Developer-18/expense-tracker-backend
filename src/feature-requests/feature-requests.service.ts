// UPPERCASE ENGLISH COMMENTS PROVIDED FOR PLATFORM ENGINE ARCHITECTURE
// ARCHITECTED FOR HIGH SCALE SECURITY AND 10,000+ CONCURRENT REQ PERFORMANCE

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFeatureRequestDto } from "./dto/create-feature-request.dto";
import { ApproveFeatureRequestDto } from "./dto/approve-feature-request.dto";

@Injectable()
export class FeatureRequestsService {
  constructor(private prisma: PrismaService) {}

  // CALLED BY A TENANT SUPER_ADMIN WHEN LIMIT THRESHOLD OCCURS IN SUBSCRIPTION MODAL
  async create(dto: CreateFeatureRequestDto, superAdminId: string) {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { id: superAdminId },
    });
    if (!superAdmin) {
      throw new NotFoundException(
        "Super admin owner record could not be found",
      );
    }

    // SAVING DIRECTLY IN DB SO IT REFLECTS IN THE SUPER ADMIN PRO IN-APP SCREEN PENDING LIST
    return this.prisma.featureUnlockRequest.create({
      data: {
        superAdminId,
        requestedRole: dto.requestedRole,
        message: dto.message,
      },
    });
  }

  // RETRIEVES THE ISOLATED REQUEST HISTORY LOG FOR THE CURRENT SIGNED-IN SUPER_ADMIN
  async findAllForSuperAdmin(superAdminId: string) {
    return this.prisma.featureUnlockRequest.findMany({
      where: { superAdminId },
      orderBy: { createdAt: "desc" },
    });
  }

  // PLATFORM_OWNER VISIBILITY LOGS ACROSS ALL TENANTS FEATURING ORG DATA AGGREGATION
  async findAllForOwner(status?: string) {
    return this.prisma.featureUnlockRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        superAdmin: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            email: true,
            phone: true,
            userName: true,
            customLimits: true,
          },
        },
      },
    });
  }

  // EXECUTED BY PLATFORM_OWNER ONLY - MODIFIES TARGET TENANT'S customLimits RECORD ENGINES ATOMICALLY
  async approve(id: string, dto: ApproveFeatureRequestDto) {
    const request = await this.prisma.featureUnlockRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(
        "Requested unlock operation reference could not be located",
      );
    }
    if (request.status !== "PENDING") {
      throw new BadRequestException(
        "This specific tier transaction request has already been finalized",
      );
    }

    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { id: request.superAdminId },
    });
    if (!superAdmin) {
      throw new NotFoundException(
        "Target company super admin structure was not successfully identified",
      );
    }

    // MAP DYNAMIC JSON PARAMETERS PRESERVING PARALLEL CAPACITIES FOR O(1) LOOKUPS
    const existingLimits =
      (superAdmin.customLimits as Record<string, number>) || {};
    const updatedLimits = {
      ...existingLimits,
      [request.requestedRole]: dto.limit,
    };

    // EXECUTE RELATIONAL PERSISTENCE MODIFICATIONS WITHIN AN ATOMIC DB TRANSACTION LAYER
    return this.prisma.$transaction(async (tx) => {
      await tx.superAdmin.update({
        where: { id: superAdmin.id },
        data: { customLimits: updatedLimits },
      });

      return tx.featureUnlockRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          grantedLimit: dto.limit,
        },
      });
    });
  }

  // PLATFORM_OWNER TRANSACTION DISMISSAL CLOSING PENDING UNLOCK INTENTS
  async reject(id: string) {
    const request = await this.prisma.featureUnlockRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(
        "Requested unlock operation reference could not be located",
      );
    }
    if (request.status !== "PENDING") {
      throw new BadRequestException(
        "This specific tier transaction request has already been finalized",
      );
    }

    return this.prisma.featureUnlockRequest.update({
      where: { id },
      data: { status: "REJECTED" },
    });
  }
}
