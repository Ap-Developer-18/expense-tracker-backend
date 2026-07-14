/*
  Warnings:

  - You are about to drop the column `amount` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `approvalStatus` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `reviewFlag` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the `project_assignments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `submittedAmount` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "project_assignments" DROP CONSTRAINT "project_assignments_accountManagerId_fkey";

-- DropForeignKey
ALTER TABLE "project_assignments" DROP CONSTRAINT "project_assignments_fieldManagerId_fkey";

-- DropForeignKey
ALTER TABLE "project_assignments" DROP CONSTRAINT "project_assignments_projectId_fkey";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "amount",
DROP COLUMN "approvalStatus",
DROP COLUMN "approvedAt",
DROP COLUMN "approvedById",
DROP COLUMN "paidAmount",
DROP COLUMN "reviewFlag",
ADD COLUMN     "reimbursedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewedByAccountManagerId" TEXT,
ADD COLUMN     "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "submittedAmount" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "project_assignments";

-- CreateTable
CREATE TABLE "project_field_managers" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fieldManagerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_field_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_account_managers" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "accountManagerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_account_managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_field_managers_projectId_fieldManagerId_key" ON "project_field_managers"("projectId", "fieldManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "project_account_managers_projectId_accountManagerId_key" ON "project_account_managers"("projectId", "accountManagerId");

-- AddForeignKey
ALTER TABLE "project_field_managers" ADD CONSTRAINT "project_field_managers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_field_managers" ADD CONSTRAINT "project_field_managers_fieldManagerId_fkey" FOREIGN KEY ("fieldManagerId") REFERENCES "field_managers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_account_managers" ADD CONSTRAINT "project_account_managers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_account_managers" ADD CONSTRAINT "project_account_managers_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "account_managers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
