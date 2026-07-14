// project-assignments/project-assignments.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { ProjectAssignmentsService } from "./project-assignments.service";
import { AssignAccountManagerDto } from "./dto/assign-account-manager.dto";
import { AssignFieldManagerDto } from "./dto/assign-field-manager.dto";
import { SetAssignmentStatusDto } from "./dto/set-assignment-status.dto";

@ApiTags("Project Assignments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("OFFICE_ADMIN")
@Controller("projects/:projectId/assignments")
export class ProjectAssignmentsController {
  constructor(private service: ProjectAssignmentsService) {}

  @Patch("field-managers/:fieldManagerId")
  setFieldManagerStatus(
    @Param("projectId") projectId: string,
    @Param("fieldManagerId") fieldManagerId: string,
    @Body() dto: SetAssignmentStatusDto,
  ) {
    return this.service.setFieldManagerStatus(
      projectId,
      fieldManagerId,
      dto.isActive,
    );
  }

  @Patch("account-managers/:accountManagerId")
  setAccountManagerStatus(
    @Param("projectId") projectId: string,
    @Param("accountManagerId") accountManagerId: string,
    @Body() dto: SetAssignmentStatusDto,
  ) {
    return this.service.setAccountManagerStatus(
      projectId,
      accountManagerId,
      dto.isActive,
    );
  }

  @Get()
  getAssignments(@Param("projectId") projectId: string) {
    return this.service.getAssignments(projectId);
  }

  @Post("field-managers")
  assignFieldManager(
    @Param("projectId") projectId: string,
    @Body() dto: AssignFieldManagerDto,
  ) {
    return this.service.assignFieldManager(projectId, dto.fieldManagerId);
  }

  @Delete("field-managers/:fieldManagerId")
  unassignFieldManager(
    @Param("projectId") projectId: string,
    @Param("fieldManagerId") fieldManagerId: string,
  ) {
    return this.service.unassignFieldManager(projectId, fieldManagerId);
  }

  @Post("account-managers")
  assignAccountManager(
    @Param("projectId") projectId: string,
    @Body() dto: AssignAccountManagerDto,
  ) {
    return this.service.assignAccountManager(projectId, dto.accountManagerId);
  }

  @Delete("account-managers/:accountManagerId")
  unassignAccountManager(
    @Param("projectId") projectId: string,
    @Param("accountManagerId") accountManagerId: string,
  ) {
    return this.service.unassignAccountManager(projectId, accountManagerId);
  }

  @Roles("OFFICE_ADMIN", "FIELD_MANAGER", "ACCOUNT_MANAGER", "SUPER_ADMIN")
  @Get("field-managers/active")
  getActiveFieldManagers(@Param("projectId") projectId: string) {
    return this.service.getActiveFieldManagersForProject(projectId);
  }
}
