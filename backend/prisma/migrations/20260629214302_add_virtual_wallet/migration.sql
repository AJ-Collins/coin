-- CreateEnum
CREATE TYPE "VirtualWalletTxType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "VirtualWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualWalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "VirtualWalletTxType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VirtualWalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualWallet_userId_key" ON "VirtualWallet"("userId");

-- CreateIndex
CREATE INDEX "VirtualWalletTransaction_walletId_idx" ON "VirtualWalletTransaction"("walletId");

-- AddForeignKey
ALTER TABLE "VirtualWallet" ADD CONSTRAINT "VirtualWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualWalletTransaction" ADD CONSTRAINT "VirtualWalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "VirtualWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
