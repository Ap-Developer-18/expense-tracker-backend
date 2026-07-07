/*
  Warnings:

  - Added the required column `superAdminId` to the `account_managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superAdminId` to the `field_managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superAdminId` to the `office_admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superAdminId` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account_managers" ADD COLUMN     "superAdminId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "field_managers" ADD COLUMN     "superAdminId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "office_admins" ADD COLUMN     "superAdminId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "superAdminId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "account_managers" ADD CONSTRAINT "account_managers_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_managers" ADD CONSTRAINT "field_managers_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_admins" ADD CONSTRAINT "office_admins_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
