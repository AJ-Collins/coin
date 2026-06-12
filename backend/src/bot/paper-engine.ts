import { PrismaClient } from "@prisma/client";
import ccxt from "ccxt";

const prisma = new PrismaClient();

interface RunningBot {
  botId: number;
  interval: ReturnType<typeof setInterval>;
  symbol: string;
}

const runningBots = new Map<number, RunningBot>();

async function log(botId: number, message: string, level = "info") {
  await prisma.botLog.create({ data: { botId, message, level } });
  console.log(`[Bot ${botId}] [${level.toUpperCase()}] ${message}`);
}

async function getBalance(currency: string): Promise<number> {
  const rec = await prisma.paperBalance.findUnique({ where: { currency } });
  return rec?.balance ?? 0;
}

async function updateBalance(currency: string, delta: number) {
  const current = await getBalance(currency);
  await prisma.paperBalance.upsert({
    where: { currency },
    update: { balance: Math.max(0, current + delta) },
    create: { currency, balance: Math.max(0, 10000 + delta) },
  });
}

async function ensureBalance(quoteCurrency: string) {
  const existing = await prisma.paperBalance.findUnique({ where: { currency: quoteCurrency } });
  if (!existing) {
    await prisma.paperBalance.create({ data: { currency: quoteCurrency, balance: 10000 } });
  }
  const base = quoteCurrency === "USDT" ? "BTC" : quoteCurrency;
  const existingBase = await prisma.paperBalance.findUnique({ where: { currency: base } });
  if (!existingBase) {
    await prisma.paperBalance.create({ data: { currency: base, balance: 0 } });
  }
}

async function getConfig(): Promise<{ winRate: number; maxLoss: number; maxGain: number }> {
  let config = await prisma.paperConfig.findFirst();
  if (!config) {
    config = await prisma.paperConfig.create({ data: { winRate: 0.65, maxLoss: 0.02, maxGain: 0.04 } });
  }
  return config;
}

// Bias fill price based on win rate config
function getBiasedFillPrice(orderPrice: number, side: string, winRate: number, maxGain: number, maxLoss: number): number {
  const isWin = Math.random() < winRate;
  const basisPoints = isWin
    ? orderPrice * (Math.random() * maxGain)
    : orderPrice * (Math.random() * maxLoss);
  // For buy: winning = price dips below order (good fill), losing = price above
  if (side === "buy") return isWin ? orderPrice - basisPoints : orderPrice + basisPoints;
  else return isWin ? orderPrice + basisPoints : orderPrice - basisPoints;
}

async function placeGridOrders(botId: number, symbol: string, settings: any, currentPrice: number) {
  const high = settings.highPrice ?? currentPrice * 1.1;
  const low  = settings.lowPrice  ?? currentPrice * 0.9;
  const levels = settings.gridLevels ?? 10;
  const qty = settings.quantityPerGrid ?? 0.0001;
  const step = (high - low) / levels;

  for (let i = 0; i <= levels; i++) {
    const price = parseFloat((low + i * step).toFixed(2));
    const side  = price >= currentPrice ? "sell" : "buy";
    await prisma.order.create({
      data: { botId, symbol, side, type: "limit", status: "pending", price, quantity: qty, filledQty: 0 },
    });
  }
  await log(botId, `Grid: placed ${levels + 1} orders from $${low.toFixed(2)} to $${high.toFixed(2)} | qty: ${qty} per level`);
}

async function placeDCAOrders(botId: number, symbol: string, settings: any, currentPrice: number) {
  const levels    = settings.levels ?? 5;
  const dropPct   = settings.dropPercent ?? 2;
  const qty       = settings.quantity ?? 0.001;
  const tpPercent = settings.tpPercent ?? 3;

  for (let i = 0; i < levels; i++) {
    const price = parseFloat((currentPrice * (1 - (i * dropPct) / 100)).toFixed(2));
    await prisma.order.create({
      data: { botId, symbol, side: "buy", type: "limit", status: "pending", price, quantity: qty, filledQty: 0 },
    });
  }
  // Single TP sell order
  const avgEntry = currentPrice * (1 - ((levels - 1) * dropPct) / 200);
  const tpPrice  = parseFloat((avgEntry * (1 + tpPercent / 100)).toFixed(2));
  await prisma.order.create({
    data: { botId, symbol, side: "sell", type: "limit", status: "pending", price: tpPrice, quantity: qty * levels, filledQty: 0 },
  });
  await log(botId, `DCA: placed ${levels} buy orders + TP at $${tpPrice}`);
}

async function placeRSIOrders(botId: number, symbol: string, settings: any, currentPrice: number, exchange: any) {
  // Fetch recent candles for RSI
  try {
    const candles = await exchange.fetchOHLCV(symbol, "1h", undefined, 20);
    const closes  = candles.map((c: number[]) => c[4]);
    const rsi     = calcRSI(closes, 14);
    const qty     = settings.quantity ?? 0.001;
    const tp      = settings.tpPercent ?? 2;
    const sl      = settings.slPercent ?? 1;

    if (rsi < (settings.oversold ?? 30)) {
      const tpPrice = parseFloat((currentPrice * (1 + tp / 100)).toFixed(2));
      await prisma.order.create({ data: { botId, symbol, side: "buy",  type: "limit", status: "pending", price: currentPrice, quantity: qty, filledQty: 0 } });
      await prisma.order.create({ data: { botId, symbol, side: "sell", type: "limit", status: "pending", price: tpPrice,      quantity: qty, filledQty: 0 } });
      await log(botId, `RSI ${rsi.toFixed(1)} — Oversold signal | BUY @ $${currentPrice} | TP @ $${tpPrice}`);
    } else if (rsi > (settings.overbought ?? 70)) {
      const tpPrice = parseFloat((currentPrice * (1 - tp / 100)).toFixed(2));
      await prisma.order.create({ data: { botId, symbol, side: "sell", type: "limit", status: "pending", price: currentPrice, quantity: qty, filledQty: 0 } });
      await prisma.order.create({ data: { botId, symbol, side: "buy",  type: "limit", status: "pending", price: tpPrice,      quantity: qty, filledQty: 0 } });
      await log(botId, `RSI ${rsi.toFixed(1)} — Overbought signal | SELL @ $${currentPrice} | TP @ $${tpPrice}`);
    } else {
      await log(botId, `RSI ${rsi.toFixed(1)} — No signal (neutral zone)`);
    }
  } catch (e: any) {
    await log(botId, `RSI calculation error: ${e.message}`, "warn");
  }
}

function calcRSI(closes: number[], period: number): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

async function simulateFills(botId: number, currentPrice: number, symbol: string, template: string, settings: any, exchange: any) {
  const cfg = await getConfig();
  const pending = await prisma.order.findMany({ where: { botId, status: "pending" } });
  const [base, quote] = symbol.split("/");

  for (const order of pending) {
    if (!order.price) continue;
    const shouldCheck =
      (order.side === "buy"  && currentPrice <= order.price * 1.005) ||
      (order.side === "sell" && currentPrice >= order.price * 0.995);

    if (!shouldCheck) continue;

    const fillPrice = getBiasedFillPrice(order.price, order.side, cfg.winRate, cfg.maxGain, cfg.maxLoss);
    const actuallyFills =
      (order.side === "buy"  && currentPrice <= fillPrice) ||
      (order.side === "sell" && currentPrice >= fillPrice);

    if (!actuallyFills) continue;

    await prisma.order.update({ where: { id: order.id }, data: { status: "filled", filledQty: order.quantity } });

    const value = fillPrice * order.quantity;
    if (order.side === "buy") {
      await updateBalance(quote, -value);
      await updateBalance(base, order.quantity);
    } else {
      await updateBalance(base, -order.quantity);
      await updateBalance(quote, value);
    }

    const quoteBalance = await getBalance(quote);
    await log(botId, `✅ ${order.side.toUpperCase()} filled @ $${fillPrice.toFixed(2)} | ${order.quantity} ${base} | Balance: $${quoteBalance.toFixed(2)} ${quote}`);

    // Grid: place counter order
    if (template === "grid") {
      const gridStep = settings.gridStep ?? (order.price * 0.02);
      const counterPrice = order.side === "buy"
        ? parseFloat((order.price + gridStep).toFixed(2))
        : parseFloat((order.price - gridStep).toFixed(2));
      const counterSide = order.side === "buy" ? "sell" : "buy";
      await prisma.order.create({
        data: { botId, symbol, side: counterSide, type: "limit", status: "pending", price: counterPrice, quantity: order.quantity, filledQty: 0 },
      });
      await log(botId, `↩️  Counter ${counterSide.toUpperCase()} placed @ $${counterPrice.toFixed(2)}`);
    }

    // RSI: re-analyze after fill
    if (template === "rsi") {
      const openOrders = await prisma.order.count({ where: { botId, status: "pending" } });
      if (openOrders === 0) {
        const ticker = await exchange.fetchTicker(symbol);
        await placeRSIOrders(botId, symbol, settings, ticker.last, exchange);
      }
    }
  }
}

export async function startPaperBot(botId: number) {
  if (runningBots.has(botId)) return;

  const bot = await prisma.bot.findUnique({ where: { id: botId }, include: { exchangeAccount: true } });
  if (!bot) throw new Error("Bot not found");

  const symbol   = `${bot.baseCurrency}/${bot.quoteCurrency}`;
  const settings = JSON.parse(bot.settings || "{}");
  const exchange = new (ccxt as any)["binance"]({ enableRateLimit: true });

  await ensureBalance(bot.quoteCurrency);
  await log(botId, `🚀 Paper bot started | Strategy: ${bot.template.toUpperCase()} | Pair: ${symbol} | Balance: $10,000 demo`);

  // Place initial orders
  const existing = await prisma.order.count({ where: { botId, status: "pending" } });
  if (existing === 0) {
    const ticker = await exchange.fetchTicker(symbol);
    const price: number = ticker.last;
    await log(botId, `📊 Current price: $${price.toLocaleString()}`);

    if (bot.template === "grid")      await placeGridOrders(botId, symbol, settings, price);
    else if (bot.template === "dca")  await placeDCAOrders(botId, symbol, settings, price);
    else if (bot.template === "rsi")  await placeRSIOrders(botId, symbol, settings, price, exchange);
  }

  const interval = setInterval(async () => {
    try {
      const ticker = await exchange.fetchTicker(symbol);
      const price: number = ticker.last;
      await log(botId, `📈 Price: $${price.toLocaleString()} | Checking orders...`);
      await simulateFills(botId, price, symbol, bot.template, settings, exchange);
    } catch (e: any) {
      await log(botId, `Error: ${e.message}`, "error");
    }
  }, 15000);

  runningBots.set(botId, { botId, interval, symbol });
}

export async function stopPaperBot(botId: number) {
  const running = runningBots.get(botId);
  if (running) {
    clearInterval(running.interval);
    runningBots.delete(botId);
    await log(botId, "⏹️  Bot stopped");
  }
}

export function isBotRunning(botId: number): boolean {
  return runningBots.has(botId);
}
