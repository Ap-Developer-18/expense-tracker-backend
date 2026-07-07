/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `super_admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `super_admins` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `super_admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `super_admins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "super_admins" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_phone_key" ON "super_admins"("phone");
