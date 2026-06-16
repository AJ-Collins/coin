import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { activateProBot, stopProBot, startProBotLoop } from "../bot/protrading-engine.js";

const router = Router();
const prisma = new PrismaClient();

// ------------------------------------------------------------------
// ADMIN: generate passkeys (give the returned `code` to the user)
// POST /api/protrading/admin/passkeys  { label?: string, count?: number }
// ------------------------------------------------------------------
router.post("/admin/passkeys", async (req, res) => {
  const { label, count = 1 } = req.body;
  const created = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(8).toString("hex").toUpperCase(); // e.g. 9F2A1B3C4D5E6F70
    const pk = await prisma.passkey.create({ data: { code, label } });
    created.push(pk);
  }
  res.json(created);
});

// ADMIN: list all passkeys (used / unused)
router.get("/admin/passkeys", async (req, res) => {
  const passkeys = await prisma.passkey.findMany({
    include: { proBot: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(passkeys);
});

// ADMIN: global win/loss simulation config
router.get("/admin/config", async (req, res) => {
  let cfg = await prisma.proBotConfig.findFirst();
  if (!cfg) cfg = await prisma.proBotConfig.create({ data: {} });
  res.json(cfg);
});

router.patch("/admin/config", async (req, res) => {
  const { winRate, avgWinPct, avgLossPct, payoutVarPct } = req.body;
  let cfg = await prisma.proBotConfig.findFirst();
  if (!cfg) cfg = await prisma.proBotConfig.create({ data: {} });
  const updated = await prisma.proBotConfig.update({
    where: { id: cfg.id },
    data: {
      ...(winRate !== undefined ? { winRate } : {}),
      ...(avgWinPct !== undefined ? { avgWinPct } : {}),
      ...(avgLossPct !== undefined ? { avgLossPct } : {}),
      ...(payoutVarPct !== undefined ? { payoutVarPct } : {}),
    },
  });
  res.json(updated);
});

// ------------------------------------------------------------------
// USER: redeem a passkey -> creates & activates a ProBot
// POST /api/protrading/activate  { code: string, tradeAmount, tradeInterval, asset }
// ------------------------------------------------------------------
router.post("/activate", async (req, res) => {
  const { code, tradeAmount, tradeInterval, asset } = req.body;
  if (!code) return res.status(400).json({ error: "Passkey is required" });

  const passkey = await prisma.passkey.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!passkey) return res.status(404).json({ error: "Invalid passkey" });
  if (passkey.isUsed) return res.status(400).json({ error: "Passkey already used" });

  const proBot = await prisma.proBot.create({
    data: {
      tradeAmount: Number(tradeAmount) || 10,
      tradeInterval: Number(tradeInterval) || 60,
      asset: asset || "EUR/USD",
    },
  });

  await prisma.passkey.update({
    where: { id: passkey.id },
    data: { isUsed: true, usedAt: new Date(), proBotId: proBot.id },
  });

  const activated = await activateProBot(proBot.id);
  res.json(activated);
});

// ------------------------------------------------------------------
// USER: get current bot (most recent activated one)
// In a multi-user system, scope this by req.user.id instead.
// ------------------------------------------------------------------
router.get("/my-bot", async (req, res) => {
  const bot = await prisma.proBot.findFirst({
    orderBy: { createdAt: "desc" },
    include: { logs: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!bot) return res.json(null);
  // return logs oldest-first for the terminal
  res.json({ ...bot, logs: bot.logs.reverse() });
});

// Update settings (only while idle/stopped)
router.patch("/:id/settings", async (req, res) => {
  const id = Number(req.params.id);
  const { tradeAmount, tradeInterval, asset } = req.body;
  const bot = await prisma.proBot.findUnique({ where: { id } });
  if (!bot) return res.status(404).json({ error: "Not found" });
  if (bot.status === "running") return res.status(400).json({ error: "Stop the bot before changing settings" });

  const updated = await prisma.proBot.update({
    where: { id },
    data: {
      ...(tradeAmount !== undefined ? { tradeAmount: Number(tradeAmount) } : {}),
      ...(tradeInterval !== undefined ? { tradeInterval: Number(tradeInterval) } : {}),
      ...(asset !== undefined ? { asset } : {}),
    },
  });
  res.json(updated);
});

router.patch("/:id/start", async (req, res) => {
  const id = Number(req.params.id);
  const bot = await prisma.proBot.update({ where: { id }, data: { status: "running", activatedAt: new Date() } });
  startProBotLoop(id);
  res.json(bot);
});

router.patch("/:id/stop", async (req, res) => {
  const id = Number(req.params.id);
  const bot = await stopProBot(id);
  res.json(bot);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await stopProBot(id).catch(() => {});
  await prisma.proBotLog.deleteMany({ where: { proBotId: id } });
  await prisma.passkey.updateMany({ where: { proBotId: id }, data: { proBotId: null, isUsed: false, usedAt: null } });
  await prisma.proBot.delete({ where: { id } });
  res.json({ success: true });
});

export { router as protradingRouter };
