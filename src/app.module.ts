import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { AccountManagersModule } from "./account-managers/account-managers.module";
import { FieldManagersModule } from "./field-managers/field-managers.module";
import { OfficeAdminsModule } from "./office-admins/office-admins.module";
import { ProjectsModule } from "./projects/projects.module";
import { ProjectAssignmentsModule } from "./project-assignments/project-assignments.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { FeatureRequestsModule } from "./feature-requests/feature-requests.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AccountManagersModule,
    FieldManagersModule,
    OfficeAdminsModule,
    FeatureRequestsModule,
    ProjectsModule,
    ProjectAssignmentsModule,
    ExpensesModule,
  ],
})
export class AppModule {}
