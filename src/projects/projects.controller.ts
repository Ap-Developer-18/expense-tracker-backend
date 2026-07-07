// projects.controller.ts
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
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@ApiTags("Projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private service: ProjectsService) {}

  // Only Super Admin can create/update/delete projects
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN")
  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.service.create(dto, req.user.superAdminId);
  }

  // Any authenticated role (Super Admin or their managers) can view their org's projects
  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.superAdminId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.superAdminId);
  }

  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.superAdminId);
  }

  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN")
  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.service.remove(id, req.user.superAdminId);
  }
}
