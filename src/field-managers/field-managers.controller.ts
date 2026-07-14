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
import { FieldManagersService } from "./field-managers.service";
import { CreateFieldManagerDto } from "./dto/create-field-manager.dto";
import { UpdateFieldManagerDto } from "./dto/update-field-manager.dto";

@ApiTags("Field Managers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("field-managers")
export class FieldManagersController {
  constructor(private service: FieldManagersService) {}

  @Roles("SUPER_ADMIN")
  @Post()
  create(@Body() dto: CreateFieldManagerDto, @Req() req: any) {
    return this.service.create(dto, req.user.superAdminId);
  }

  @Roles("SUPER_ADMIN", "OFFICE_ADMIN", "FIELD_MANAGER")
  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.superAdminId);
  }

  @Roles("SUPER_ADMIN", "OFFICE_ADMIN")
  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.superAdminId);
  }

  @Roles("SUPER_ADMIN")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateFieldManagerDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.superAdminId);
  }

  @Roles("SUPER_ADMIN")
  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.service.remove(id, req.user.superAdminId);
  }
}
