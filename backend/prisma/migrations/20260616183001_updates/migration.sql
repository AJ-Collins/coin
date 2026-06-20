/*
  Warnings:

  - You are about to drop the column `isUsed` on the `Passkey` table. All the data in the column will be lost.
  - You are about to drop the column `proBotId` on the `Passkey` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `Passkey` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Passkey` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Passkey" DROP CONSTRAINT "Passkey_proBotId_fkey";

-- DropForeignKey
ALTER TABLE "Passkey" DROP CONSTRAINT "Passkey_userId_fkey";

-- DropIndex
DROP INDEX "Passkey_proBotId_key";

-- AlterTable
ALTER TABLE "Passkey" DROP COLUMN "isUsed",
DROP COLUMN "proBotId",
DROP COLUMN "usedAt",
DROP COLUMN "userId";
