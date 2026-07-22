// office-admins.controller.ts
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
import { OfficeAdminsService } from "./office-admins.service";
import { CreateOfficeAdminDto } from "./dto/create-office-admin.dto";
import { UpdateOfficeAdminDto } from "./dto/update-office-admin.dto";

@ApiTags("Office Admins")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN")
@Controller("office-admins")
export class OfficeAdminsController {
  constructor(private service: OfficeAdminsService) {}

  @Post()
  create(@Body() dto: CreateOfficeAdminDto, @Req() req: any) {
    return this.service.create(dto, req.user.superAdminId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.getAllCredentials(req.user.superAdminId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.superAdminId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateOfficeAdminDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.superAdminId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.service.remove(id, req.user.superAdminId);
  }
}
