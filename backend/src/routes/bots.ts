import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { startPaperBot, stopPaperBot } from "../bot/paper-engine.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const bots = await prisma.bot.findMany({ include: { exchangeAccount: true, logs: { take: 5, orderBy: { createdAt: "desc" } } } });
  res.json(bots);
});

router.get("/:id", async (req, res) => {
  const bot = await prisma.bot.findUnique({
    where: { id: Number(req.params.id) },
    include: { exchangeAccount: true, orders: { orderBy: { createdAt: "desc" }, take: 100 }, logs: { orderBy: { createdAt: "desc" }, take: 50 } }
  });
  if (!bot) return res.status(404).json({ error: "Not found" });
  res.json(bot);
});

router.get("/:id/logs", async (req, res) => {
  const logs = await prisma.botLog.findMany({
    where: { botId: Number(req.params.id) },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  res.json(logs);
});

router.post("/", async (req, res) => {
  const { name, template, settings, baseCurrency, quoteCurrency, exchangeAccountId } = req.body;
  const bot = await prisma.bot.create({
    data: { name, template, settings: JSON.stringify(settings ?? {}), baseCurrency, quoteCurrency, exchangeAccountId: Number(exchangeAccountId) }
  });
  res.json(bot);
});

router.patch("/:id/start", async (req, res) => {
  try {
    const bot = await prisma.bot.update({ where: { id: Number(req.params.id) }, data: { status: "running" } });
    await startPaperBot(bot.id);
    res.json(bot);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id/stop", async (req, res) => {
  try {
    const bot = await prisma.bot.update({ where: { id: Number(req.params.id) }, data: { status: "stopped" } });
    await stopPaperBot(bot.id);
    res.json(bot);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  await stopPaperBot(Number(req.params.id));
  await prisma.bot.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export { router as botsRouter };
