// project-assignments/my-assignments.controller.ts
import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { ProjectAssignmentsService } from "./project-assignments.service";

@ApiTags("My Assignments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("my-projects")
export class MyAssignmentsController {
  constructor(private service: ProjectAssignmentsService) {}

  @Get()
  getAssignments(@Param("projectId") projectId: string) {
    return this.service.getAssignments(projectId);
  }

  @Roles("ACCOUNT_MANAGER")
  @Get("account-manager")
  getMyProjectsAsAccountManager(@Req() req: any) {
    return this.service.getProjectsForAccountManager(req.user.id);
  }

  @Roles("FIELD_MANAGER")
  @Get("field-manager")
  getMyProjectsAsFieldManager(@Req() req: any) {
    return this.service.getProjectsForFieldManager(req.user.id);
  }
}
