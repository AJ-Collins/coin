-- CreateTable
CREATE TABLE "PaperBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currency" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaperConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "winRate" REAL NOT NULL DEFAULT 0.65,
    "maxLoss" REAL NOT NULL DEFAULT 0.02,
    "maxGain" REAL NOT NULL DEFAULT 0.04
);

-- CreateIndex
CREATE UNIQUE INDEX "PaperBalance_currency_key" ON "PaperBalance"("currency");
