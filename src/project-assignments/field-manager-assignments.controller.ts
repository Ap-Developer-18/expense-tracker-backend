// project-assignments/field-manager-assignments.controller.ts
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { ProjectAssignmentsService } from "./project-assignments.service";

@ApiTags("Field Manager Assignments (Admin)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("OFFICE_ADMIN")
@Controller("field-managers")
export class FieldManagerAssignmentsController {
  constructor(private service: ProjectAssignmentsService) {}

  @Get(":fieldManagerId/projects")
  getProjectsForFieldManager(@Param("fieldManagerId") fieldManagerId: string) {
    return this.service.getProjectsForFieldManager(fieldManagerId);
  }
}
