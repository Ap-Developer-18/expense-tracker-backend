import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

type Role =
  | "SUPER_ADMIN"
  | "ACCOUNT_MANAGER"
  | "FIELD_MANAGER"
  | "OFFICE_ADMIN";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Multi-tenant: unlimited Super Admins can register.
    // Each one becomes the owner of their own organization.
    const duplicate = await this.prisma.superAdmin.findFirst({
      where: {
        OR: [
          { userName: dto.userName },
          { email: dto.email },
          { phone: dto.phone },
        ],
      },
    });
    if (duplicate) {
      throw new ConflictException("Username, email, or phone already in use");
    }

    const hashedPasscode = await bcrypt.hash(dto.passcode, 10);

    const admin = await this.prisma.superAdmin.create({
      data: {
        fullName: dto.fullName,
        companyName: dto.companyName,
        userName: dto.userName,
        email: dto.email,
        phone: dto.phone,
        passcode: hashedPasscode,
      },
    });

    const { passcode, ...result } = admin;
    return result;
  }

  async login(dto: LoginDto) {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { userName: dto.userName },
    });
    if (superAdmin) {
      return this.buildResponse(superAdmin, "SUPER_ADMIN", dto.passcode);
    }

    const accountManager = await this.prisma.accountManager.findUnique({
      where: { userName: dto.userName },
      include: { superAdmin: true },
    });
    if (accountManager) {
      if (!accountManager.isActive) {
        throw new UnauthorizedException(
          "Account is disabled. Contact Super Admin.",
        );
      }
      return this.buildResponse(
        accountManager,
        "ACCOUNT_MANAGER",
        dto.passcode,
      );
    }

    const fieldManager = await this.prisma.fieldManager.findUnique({
      where: { userName: dto.userName },
      include: { superAdmin: true },
    });
    if (fieldManager) {
      if (!fieldManager.isActive) {
        throw new UnauthorizedException(
          "Account is disabled. Contact Super Admin.",
        );
      }
      return this.buildResponse(fieldManager, "FIELD_MANAGER", dto.passcode);
    }

    const officeAdmin = await this.prisma.officeAdmin.findUnique({
      where: { userName: dto.userName },
      include: { superAdmin: true },
    });
    if (officeAdmin) {
      if (!officeAdmin.isActive) {
        throw new UnauthorizedException(
          "Account is disabled. Contact Super Admin.",
        );
      }
      return this.buildResponse(officeAdmin, "OFFICE_ADMIN", dto.passcode);
    }

    throw new UnauthorizedException("Invalid credentials");
  }

  async checkSuperAdminExists() {
    const count = await this.prisma.superAdmin.count();
    return { exists: count > 0 };
  }

  private async buildResponse(user: any, role: Role, plainPasscode: string) {
    const isMatch = await bcrypt.compare(plainPasscode, user.passcode);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: user.id,
      userName: user.userName,
      role,
      // Managers carry their Super Admin's id in the token too —
      // useful later for RolesGuard-adjacent checks if needed.
      superAdminId: role === "SUPER_ADMIN" ? user.id : user.superAdminId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        userName: user.userName,
        role,
        // Only present for managers — tells them whose organization they belong to
        superAdmin:
          role === "SUPER_ADMIN"
            ? undefined
            : {
                id: user.superAdmin.id,
                fullName: user.superAdmin.fullName,
              },
      },
    };
  }
}
