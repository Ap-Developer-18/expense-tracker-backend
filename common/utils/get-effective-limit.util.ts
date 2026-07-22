// UPPERCASE ENGLISH COMMENTS PROVIDED FOR MULTI-TENANT CAPACITY COMPLIANCE
// RESOLVES DYNAMIC TENANT IN-APP UNLOCKS WITH A SAFE FALLBACK TO TIER CONSTANTS

import { PrismaService } from "../../src/prisma/prisma.service";
import { ROLE_LIMITS } from "../constants/limits.constant";

type LimitKey = keyof typeof ROLE_LIMITS;

export async function getEffectiveLimit(
  prisma: PrismaService,
  superAdminId: string,
  role: LimitKey,
): Promise<number> {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { id: superAdminId },
    select: { customLimits: true },
  });

  const customLimits =
    (superAdmin?.customLimits as Record<string, number>) || {};

  // IF CUSTOM LIMIT EXISTS FOR THIS ROLE, RETURN IT; OTHERWISE FALLBACK TO FREE TIER DEFAULT
  return customLimits[role] ?? ROLE_LIMITS[role];
}
