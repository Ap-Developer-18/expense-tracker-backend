-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_reviewedByAccountManagerId_fkey" FOREIGN KEY ("reviewedByAccountManagerId") REFERENCES "account_managers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
