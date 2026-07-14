import { Module } from "@nestjs/common";
import { ProjectAssignmentsController } from "./project-assignments.controller";
import { MyAssignmentsController } from "./my-assignments.controller";
import { FieldManagerAssignmentsController } from "./field-manager-assignments.controller";
import { ProjectAssignmentsService } from "./project-assignments.service";

@Module({
  controllers: [
    ProjectAssignmentsController,
    MyAssignmentsController,
    FieldManagerAssignmentsController,
  ],
  providers: [ProjectAssignmentsService],
})
export class ProjectAssignmentsModule {}
