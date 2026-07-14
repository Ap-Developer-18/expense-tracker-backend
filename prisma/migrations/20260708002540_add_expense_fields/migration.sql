/*
  Warnings:

  - Added the required column `mode` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidFor` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiver` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseMode" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaidForCategory" AS ENUM ('LABOR', 'MATERIAL', 'TRANSPORT', 'FOOD', 'ACCOMMODATION', 'MISCELLANEOUS', 'OTHER');

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "mode" "ExpenseMode" NOT NULL,
ADD COLUMN     "paidFor" "PaidForCategory" NOT NULL,
ADD COLUMN     "receiver" TEXT NOT NULL;
