import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get balance
router.get("/balance", async (req, res) => {
  const balances = await prisma.paperBalance.findMany();
  res.json(balances);
});

// Reset balance
router.post("/balance/reset", async (req, res) => {
  await prisma.paperBalance.deleteMany();
  res.json({ success: true, message: "Balance reset to $10,000" });
});

// Get config
router.get("/config", async (req, res) => {
  let config = await prisma.paperConfig.findFirst();
  if (!config) config = await prisma.paperConfig.create({ data: { winRate: 0.65, maxLoss: 0.02, maxGain: 0.04 } });
  res.json(config);
});

// Update config
router.patch("/config", async (req, res) => {
  const { winRate, maxLoss, maxGain } = req.body;
  let config = await prisma.paperConfig.findFirst();
  if (!config) {
    config = await prisma.paperConfig.create({ data: { winRate, maxLoss, maxGain } });
  } else {
    config = await prisma.paperConfig.update({ where: { id: config.id }, data: { winRate, maxLoss, maxGain } });
  }
  res.json(config);
});

export { router as paperRouter };
