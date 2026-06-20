/*
  Warnings:

  - A unique constraint covering the columns `[proBotId]` on the table `Passkey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Passkey" ADD COLUMN     "proBotId" INTEGER,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Passkey_proBotId_key" ON "Passkey"("proBotId");

-- AddForeignKey
ALTER TABLE "Passkey" ADD CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passkey" ADD CONSTRAINT "Passkey_proBotId_fkey" FOREIGN KEY ("proBotId") REFERENCES "ProBot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
