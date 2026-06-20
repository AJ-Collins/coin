import { LogLevel } from "@prisma/client";

import { prisma } from "../prisma";

interface RunningProBot {
  proBotId: number;
  interval: ReturnType<typeof setInterval>;
  startedAt: number;
  intervalSec: number;
}

const runningProBots = new Map<number, RunningProBot>();
const TICK_MS = 2000;
const SCAN_LOG_EVERY_SEC = 2;

type Broadcaster = (proBotId: number, payload: any) => void;
let broadcast: Broadcaster = () => {};

export function setProBotBroadcaster(fn: Broadcaster) {
  broadcast = fn;
}

function rand(min: number, max: number, decimals = 2): number {
  return Math.round((Math.random() * (max - min) + min) * 10 ** decimals) / 10 ** decimals;
}

function randomScanMessage(asset: string): string {
  const generators = [
    () => `RSI(14) on ${asset}: ${rand(20, 80, 1)} — ${rand(20, 80) > 70 ? "overbought" : rand(20, 80) < 30 ? "oversold" : "neutral"} zone`,
    () => `EMA(9/21) on ${asset}: ${rand(0.9, 1.1, 4) > rand(0.9, 1.1, 4) ? "bullish" : "bearish"} crossover forming`,
    () => `Volume on ${asset} at ${rand(60, 140, 1)}% of 24h avg — nominal parameters`,
    () => `Order book spread on ${asset}: ${rand(0.1, 2.5, 2)} pips — liquidity check passed`,
    () => `Sentiment score for ${asset}: ${rand(-1, 1, 2)}`,
    () => `ATR(14) on ${asset}: ${rand(0.0005, 0.004, 4)} — volatility within tolerance`,
    () => `Latency check to liquidity provider: ${rand(8, 45, 0)}ms — nominal`,
  ];
  return generators[Math.floor(Math.random() * generators.length)]();
}

function simulateTrade(tradeAmount: number, cfg: any) {
  const isWin = Math.random() < cfg.winRate;
  const basePct = isWin ? cfg.avgWinPct : cfg.avgLossPct;
  const variance = 1 + (Math.random() * 2 - 1) * cfg.payoutVarPct;
  const pct = Math.max(0.0001, basePct * variance);
  const pnl = isWin ? tradeAmount * pct : -tradeAmount * pct;
  const direction = Math.random() < 0.5 ? "BUY" : "SELL";
  return { isWin, pnl: Math.round(pnl * 100) / 100, direction };
}

async function log(proBotId: number, message: string, level: LogLevel = "INFO") {
  const entry = await prisma.proBotLog.create({ 
    data: { 
      proBotId, 
      message, 
      level
    } 
  });
  
  broadcast(proBotId, { message_type: "log", log: `[${new Date().toLocaleTimeString()}] ${message}` });
  return entry;
}

async function executeTradeCycle(proBotId: number) {
  const bot = await prisma.proBot.findUnique({ 
    where: { id: proBotId }, 
    include: { account: true } 
  });
  
  if (!bot || bot.status !== "RUNNING") return;

  if (Number(bot.account.balance) < bot.tradeAmount) {
    await log(proBotId, `Balance $${Number(bot.account.balance).toFixed(2)} below threshold — halting systems`, "ERROR");
    await stopProBot(proBotId);
    return;
  }

  const cfg = await prisma.proBotConfig.findFirst() || await prisma.proBotConfig.create({ data: {} });
  // Use a fraction of the configured stake per micro-trade so several can fit in one cycle
  const microStake = Math.max(1, Math.round((bot.tradeAmount * (0.4 + Math.random() * 0.4)) * 100) / 100);
  const { isWin, pnl, direction } = simulateTrade(microStake, cfg);

  // Entry price the trade is "opening" at
  const entryPrice = 1 + (Math.random() - 0.5) * 0.002;
  const exitPrice = entryPrice + (pnl / microStake) * entryPrice;

  // 1. Log the analysis conclusion that led to this trade
  const confidence = (60 + Math.random() * 35).toFixed(1);
  await log(
    proBotId,
    `Signal confirmed on ${bot.asset}: ${direction} bias detected (confidence ${confidence}%)`,
    "INFO"
  );

  // 2. Log the trade being opened
  await log(
    proBotId,
    `[EXECUTION] → Opening ${direction} position on ${bot.asset} | Stake: $${microStake.toFixed(2)} @ ${entryPrice.toFixed(5)}`,
    "INFO"
  );

  const [updatedBot, updatedAccount] = await prisma.$transaction([
    prisma.proBot.update({
      where: { id: proBotId },
      data: {
        tradeCount: { increment: 1 }, 
        wins: { increment: isWin ? 1 : 0 }, 
        profit: { increment: pnl } 
      },
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
        stake: microStake,
        payout: microStake + pnl,
        duration: bot.tradeInterval,
        entryPrice,
        exitPrice,
        profit: pnl,
        status: "COMPLETED",
        endTime: new Date(),
      },
    }),
  ]);

  // 3. Log the closed result with full breakdown
  const sign = pnl >= 0 ? "+" : "";
  const newBalance = Number(updatedAccount.balance);
  await log(
    proBotId,
    `[EXECUTION] ${isWin ? "✓ WIN" : "✗ LOSS"} — Closed ${direction} on ${bot.asset} @ ${exitPrice.toFixed(5)} | P&L: ${sign}$${pnl.toFixed(2)} | Balance: $${newBalance.toFixed(2)}`,
    isWin ? "SUCCESS" : "WARN"
  );

  broadcast(proBotId, { message_type: "bot", data: { ...updatedBot, balance: newBalance } });
}

export async function activateProBot(proBotId: number) {
  const bot = await prisma.proBot.update({
    where: { id: proBotId },
    data: { status: "RUNNING", activatedAt: new Date() },
  });
  
  await log(proBotId, "✓ Bot instance initialized", "SUCCESS");
  startProBotLoop(proBotId);
  return bot;
}

// Picks how many seconds until the next micro-trade fires.
// Scales with the overall interval so short intervals (30s) still fit 2-4 trades,
// and long intervals (5min) feel busier without spamming.
function nextTradeDelaySec(intervalSec: number): number {
  const minGap = Math.max(4, intervalSec * 0.12);
  const maxGap = Math.max(minGap + 2, intervalSec * 0.3);
  return minGap + Math.random() * (maxGap - minGap);
}

export function startProBotLoop(proBotId: number) {
  if (runningProBots.has(proBotId)) return;

  prisma.proBot.findUnique({ where: { id: proBotId } }).then((bot) => {
    if (!bot || bot.status !== "RUNNING") return;

    const intervalSec = bot.tradeInterval > 0 ? bot.tradeInterval : 60;
    const startedAt = Date.now();
    let stopped = false;
    let tradeInFlight = false;
    let nextTradeAt = nextTradeDelaySec(intervalSec); // seconds-since-start to fire next trade

    const interval = setInterval(async () => {
      if (stopped) return;
      const elapsedSec = (Date.now() - startedAt) / 1000;

      if (Math.floor(elapsedSec) % SCAN_LOG_EVERY_SEC === 0) {
        await log(proBotId, randomScanMessage(bot.asset), "INFO");
      }

      broadcast(proBotId, {
        message_type: "progress",
        data: { elapsed: Math.min(elapsedSec, intervalSec), interval: intervalSec },
      });

      // Fire a micro-trade if it's due, there's still room left in the cycle,
      // and the previous one has finished closing.
      if (
        !tradeInFlight &&
        elapsedSec >= nextTradeAt &&
        elapsedSec < intervalSec - 1 // leave at least 1s before the cycle ends
      ) {
        tradeInFlight = true;
        try {
          await executeTradeCycle(proBotId);
        } catch (err) {
          console.error(`[ProBot ${proBotId}] trade cycle error:`, err);
          await log(proBotId, `⚠ Internal error during trade execution — skipping cycle`, "ERROR");
        }
        tradeInFlight = false;
        nextTradeAt = elapsedSec + nextTradeDelaySec(intervalSec);
      }

      if (!stopped && elapsedSec >= intervalSec) {
        stopped = true;
        await stopProBot(proBotId); // cycle complete, halt
      }
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
  
  const bot = await prisma.proBot.update({
    where: { id: proBotId },
    data: { status: "STOPPED" },
    include: { account: true },
  });
  
  await log(proBotId, "⏹ AI Bot stopped", "WARN");
  broadcast(proBotId, { message_type: "bot", data: { ...bot, balance: Number(bot.account.balance) } });
  return bot;
}

export async function resumeRunningProBots() {
  const running = await prisma.proBot.findMany({ where: { status: "RUNNING" } });
  for (const bot of running) {
    startProBotLoop(bot.id);
  }
}