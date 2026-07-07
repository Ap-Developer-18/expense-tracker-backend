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
import { AccountManagersService } from "./account-managers.service";
import { CreateAccountManagerDto } from "./dto/create-account-manager.dto";
import { UpdateAccountManagerDto } from "./dto/update-account-manager.dto";

@ApiTags("Account Managers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN")
@Controller("account-managers")
export class AccountManagersController {
  constructor(private service: AccountManagersService) {}

  @Post()
  create(@Body() dto: CreateAccountManagerDto, @Req() req: any) {
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
    @Body() dto: UpdateAccountManagerDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.superAdminId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.service.remove(id, req.user.superAdminId);
  }
}
