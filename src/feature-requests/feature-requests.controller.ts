// UPPERCASE ENGLISH COMMENTS PROVIDED FOR MULTI-TENANT ROUTING ARCHITECTURE
// DESIGNED FOR 10,000+ CONCURRENT ACCESS STABILITY WITH ROLE-BASED ACCESS CONTROL

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { FeatureRequestsService } from "./feature-requests.service";
import { CreateFeatureRequestDto } from "./dto/create-feature-request.dto";
import { ApproveFeatureRequestDto } from "./dto/approve-feature-request.dto";

@ApiTags("Feature Requests")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("feature-requests")
export class FeatureRequestsController {
  constructor(private readonly service: FeatureRequestsService) {}

  // DISPATCHED BY A TENANT SUPER_ADMIN WHEN LIMIT EXCEEDED POPUP INTENT TRIGGERS
  @Roles("SUPER_ADMIN")
  @Post()
  create(@Body() dto: CreateFeatureRequestDto, @Req() req: any) {
    return this.service.create(dto, req.user.superAdminId);
  }

  // RETRIEVES THE COMPLETE TRANSACTION HISTORY SPECIFIC ONLY TO THE REQUESTING SUPER_ADMIN
  @Roles("SUPER_ADMIN")
  @Get()
  findAll(@Req() req: any) {
    return this.service.findAllForSuperAdmin(req.user.superAdminId);
  }

  // CONSUMED EXCLUSIVELY BY THE PLATFORM_OWNER TO MONITOR INBOUND ACTION BADGES AND TELEMETRY PANELS
  @Roles("PLATFORM_OWNER")
  @Get("all")
  findAllForOwner(@Query("status") status?: string) {
    return this.service.findAllForOwner(status);
  }

  // EXECUTED BY PLATFORM_OWNER TO ATOMICALLY ALTER MULTI-TENANT ENTITY THRESHOLDS IN DATABASE
  @Roles("PLATFORM_OWNER")
  @Patch(":id/approve")
  approve(@Param("id") id: string, @Body() dto: ApproveFeatureRequestDto) {
    return this.service.approve(id, dto);
  }

  // EXECUTED BY PLATFORM_OWNER TO CLOSE OUTBOUND REQ MATRICES WITHOUT RAISING SYSTEM CAPACITY
  @Roles("PLATFORM_OWNER")
  @Patch(":id/reject")
  reject(@Param("id") id: string) {
    return this.service.reject(id);
  }
}
