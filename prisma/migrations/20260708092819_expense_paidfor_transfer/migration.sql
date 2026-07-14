/*
  Warnings:

  - The values [LABOR,MATERIAL,TRANSPORT,FOOD,ACCOMMODATION,OTHER] on the enum `PaidForCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "PaidForCategory_new" AS ENUM ('MISCELLANEOUS', 'TRAVEL', 'TRANSFER');
ALTER TABLE "expenses" ALTER COLUMN "paidFor" TYPE "PaidForCategory_new" USING ("paidFor"::text::"PaidForCategory_new");
ALTER TYPE "PaidForCategory" RENAME TO "PaidForCategory_old";
ALTER TYPE "PaidForCategory_new" RENAME TO "PaidForCategory";
DROP TYPE "public"."PaidForCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "transferRespondedAt" TIMESTAMP(3),
ADD COLUMN     "transferStatus" "TransferStatus",
ADD COLUMN     "transferToFieldManagerId" TEXT;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_transferToFieldManagerId_fkey" FOREIGN KEY ("transferToFieldManagerId") REFERENCES "field_managers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
