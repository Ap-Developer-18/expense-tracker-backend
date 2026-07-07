// field-managers.controller.ts
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
@Roles("SUPER_ADMIN")
@Controller("field-managers")
export class FieldManagersController {
  constructor(private service: FieldManagersService) {}

  @Post()
  create(@Body() dto: CreateFieldManagerDto, @Req() req: any) {
    return this.service.create(dto, req.user.superAdminId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.superAdminId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.superAdminId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateFieldManagerDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.superAdminId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.service.remove(id, req.user.superAdminId);
  }
}
