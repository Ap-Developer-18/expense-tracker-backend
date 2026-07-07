import { Module } from '@nestjs/common';
import { FieldManagersController } from './field-managers.controller';
import { FieldManagersService } from './field-managers.service';

@Module({
  controllers: [FieldManagersController],
  providers: [FieldManagersService],
})
export class FieldManagersModule {}
