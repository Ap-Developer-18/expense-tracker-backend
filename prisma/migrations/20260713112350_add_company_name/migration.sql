/*
  Warnings:

  - Added the required column `companyName` to the `super_admins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "super_admins" ADD COLUMN     "companyName" TEXT NOT NULL;
