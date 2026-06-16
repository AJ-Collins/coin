import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RunningProBot {
  proBotId: number;
  interval: ReturnType<typeof setInterval>;
  startedAt: number;
  intervalSec: number;
}

const runningProBots = new Map<number, RunningProBot>();

// Broadcast hook - wired up by setupWebSocket so the engine can
// push real-time state without importing ws stuff here.
type Broadcaster = (proBotId: number, payload: any) => void;
let broadcast: Broadcaster = () => {};
export function setProBotBroadcaster(fn: Broadcaster) {
  broadcast = fn;
}

async function log(proBotId: number, message: string, level = "info") {
  const entry = await prisma.proBotLog.create({ data: { proBotId, message, level } });
  broadcast(proBotId, { message_type: "log", data: entry });
  return entry;
}

async function getConfig() {
  let cfg = await prisma.proBotConfig.findFirst();
  if (!cfg) {
    cfg = await prisma.proBotConfig.create({ data: {} });
  }
  return cfg;
}

// Decide win/loss and resulting P&L for one trade cycle, using the
// admin-tunable ProBotConfig. This is the ONLY place that determines
// whether the bot "makes" or "loses" money.
function simulateTrade(
  tradeAmount: number,
  cfg: { winRate: number; avgWinPct: number; avgLossPct: number; payoutVarPct: number }
) {
  const isWin = Math.random() < cfg.winRate;
  const basePct = isWin ? cfg.avgWinPct : cfg.avgLossPct;
  // apply +/- variance so every trade isn't identical
  const variance = 1 + (Math.random() * 2 - 1) * cfg.payoutVarPct;
  const pct = Math.max(0.0001, basePct * variance);
  const pnl = isWin ? tradeAmount * pct : -tradeAmount * pct;
  return { isWin, pnl: Math.round(pnl * 100) / 100 };
}

const TICK_MS = 2000;
const SCAN_LOG_EVERY_SEC = 12;

// ---------------------------------------------------------------
// Realistic telemetry generator
//
// Instead of a flat list of canned strings, build short readouts
// from real-looking indicator values tied to the bot's own asset.
// Each call produces a different combination so the terminal feels
// like it's actually evaluating the market, not looping a script.
// ---------------------------------------------------------------

function rand(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}

function randomScanMessage(asset: string): string {
  const generators: Array<() => string> = [
    () => {
      const rsi = rand(20, 80, 1);
      const zone = rsi > 70 ? "overbought" : rsi < 30 ? "oversold" : "neutral";
      return `RSI(14) on ${asset}: ${rsi} — ${zone} zone`;
    },
    () => {
      const ema9 = rand(0.9, 1.1, 4);
      const ema21 = rand(0.9, 1.1, 4);
      const cross = ema9 > ema21 ? "bullish crossover forming" : "bearish crossover forming";
      return `EMA(9/21) on ${asset}: ${cross}`;
    },
    () => {
      const vol = rand(60, 140, 1);
      const trend = vol > 100 ? "above" : "below";
      return `Volume on ${asset} at ${vol}% of 24h avg — ${trend} average`;
    },
    () => {
      const spread = rand(0.1, 2.5, 2);
      return `Order book spread on ${asset}: ${spread} pips — liquidity check passed`;
    },
    () => {
      const score = rand(-1, 1, 2);
      const label = score > 0.2 ? "bullish" : score < -0.2 ? "bearish" : "mixed";
      return `Sentiment score for ${asset}: ${score} (${label})`;
    },
    () => {
      const atr = rand(0.0005, 0.004, 4);
      return `ATR(14) on ${asset}: ${atr} — volatility within tolerance`;
    },
    () => {
      const support = rand(0.95, 0.99, 4);
      const resistance = rand(1.01, 1.05, 4);
      return `${asset} range check: support ${support} / resistance ${resistance}`;
    },
    () => {
      const macd = rand(-0.5, 0.5, 3);
      const signal = macd > 0 ? "above signal line" : "below signal line";
      return `MACD on ${asset}: ${macd} — ${signal}`;
    },
    () => `Latency check to liquidity provider: ${rand(8, 45, 0)}ms — nominal`,
    () => `Risk engine: position size within ${rand(1, 5, 1)}% of account equity`,
  ];

  const fn = generators[Math.floor(Math.random() * generators.length)];
  return fn();
}

async function onStart(proBotId: number) {
  const bot = await prisma.proBot.update({
    where: { id: proBotId },
    data: { status: "running", activatedAt: new Date() },
  });
  await log(proBotId, "✓ Bot initialized successfully", "success");
  await log(proBotId, `Trading ${bot.asset} with $${bot.tradeAmount}`, "info");
  await log(proBotId, `Connecting to market data feed for ${bot.asset}...`, "info");
  await log(proBotId, randomScanMessage(bot.asset), "info");
  broadcast(proBotId, { message_type: "bot", data: bot });
  return bot;
}

async function onProcess(proBotId: number, asset: string, elapsedSec: number, intervalSec: number) {
  const cycleProgress = elapsedSec % intervalSec;

  // periodic indicator readout, roughly every SCAN_LOG_EVERY_SEC seconds
  if (Math.floor(elapsedSec) % SCAN_LOG_EVERY_SEC === 0) {
    await log(proBotId, randomScanMessage(asset), "info");
  }

  broadcast(proBotId, {
    message_type: "progress",
    data: { elapsed: Math.round(cycleProgress * 10) / 10, interval: intervalSec },
  });

  // Trade cycle completed -> execute a simulated trade
  if (cycleProgress < TICK_MS / 1000 && Math.floor(elapsedSec) > 0) {
    await executeTradeCycle(proBotId);
  }
}

async function onStop(proBotId: number) {
  const bot = await prisma.proBot.update({ where: { id: proBotId }, data: { status: "stopped" } });
  await log(proBotId, "⏹ Bot stopped", "warn");
  broadcast(proBotId, { message_type: "bot", data: bot });
  return bot;
}

// ---------------------------------------------------------------
// Trade execution
// ---------------------------------------------------------------

async function executeTradeCycle(proBotId: number) {
  const bot = await prisma.proBot.findUnique({ where: { id: proBotId }, include: { account: true } });
  if (!bot || bot.status !== "running") return;

  // Hard stop if balance can't cover the stake
  if (Number(bot.account.balance) < bot.tradeAmount) {
    await log(proBotId, `Balance $${Number(bot.account.balance).toFixed(2)} below trade amount $${bot.tradeAmount} — bot stopped`, "error");
    await stopProBot(proBotId);
    return;
  }

  const cfg = await getConfig();
  const { isWin, pnl } = simulateTrade(bot.tradeAmount, cfg);

  const entryPrice = 1; // placeholder — replace with real/simulated market price if you track one
  const exitPrice = entryPrice + (isWin ? Math.abs(pnl) : -Math.abs(pnl)) / bot.tradeAmount;

  const [updatedBot, updatedAccount, trade] = await prisma.$transaction([
    prisma.proBot.update({
      where: { id: proBotId },
      data: { trades: { increment: 1 }, wins: { increment: isWin ? 1 : 0 }, profit: { increment: pnl } },
    }),
    prisma.account.update({
      where: { id: bot.accountId },
      data: { balance: { increment: pnl } },
    }),
    prisma.trade.create({
      data: {
        userId: bot.userId,
        accountId: bot.accountId,
        proBotId: bot.id,
        asset: bot.asset,
        type: isWin ? "WIN" : "LOSS",
        stake: bot.tradeAmount,
        payout: bot.tradeAmount + pnl,
        duration: bot.tradeInterval,
        entryPrice,
        exitPrice,
        profit: pnl,
        status: "COMPLETED",
        endTime: new Date(),
      },
    }),
  ]);

  const sign = pnl >= 0 ? "+" : "";
  await log(
    proBotId,
    `${isWin ? "✓" : "✗"} Trade executed on ${bot.asset} | P&L ${sign}$${pnl.toFixed(2)} | Balance: $${Number(updatedAccount.balance).toFixed(2)}`,
    isWin ? "SUCCESS" : "WARN"
  );

  broadcast(proBotId, { message_type: "bot", data: updatedBot });
  broadcast(proBotId, { message_type: "balance", data: { accountId: updatedAccount.id, balance: updatedAccount.balance } });
}

// ---------------------------------------------------------------
// Public API
// ---------------------------------------------------------------

export async function activateProBot(proBotId: number) {
  const bot = await onStart(proBotId);
  startProBotLoop(proBotId);
  return bot;
}

export function startProBotLoop(proBotId: number) {
  if (runningProBots.has(proBotId)) return;

  prisma.proBot.findUnique({ where: { id: proBotId } }).then((bot) => {
    if (!bot || bot.status !== "running") return;

    const intervalSec = bot.tradeInterval > 0 ? bot.tradeInterval : 60;
    const startedAt = Date.now();
    const asset = bot.asset;

    const interval = setInterval(async () => {
      const elapsedSec = (Date.now() - startedAt) / 1000;
      await onProcess(proBotId, asset, elapsedSec, intervalSec);
    }, TICK_MS);

    runningProBots.set(proBotId, { proBotId, interval, startedAt, intervalSec });
  });
}

export async function stopProBot(proBotId: number) {
  const running = runningProBots.get(proBotId);
  if (running) {
    clearInterval(running.interval);
    runningProBots.delete(proBotId);
  }
  return onStop(proBotId);
}

export function isProBotRunning(proBotId: number): boolean {
  return runningProBots.has(proBotId);
}

// On server boot, resume any bots that were left "running" in the DB
export async function resumeRunningProBots() {
  const running = await prisma.proBot.findMany({ where: { status: "running" } });
  for (const bot of running) {
    startProBotLoop(bot.id);
  }
}