import { Router } from "express";
import ccxt from "ccxt";

const router = Router();
const exchangeInstances: Record<string, any> = {};

function getExchange(exchangeId: string) {
  if (!exchangeInstances[exchangeId]) {
    exchangeInstances[exchangeId] = new (ccxt as any)[exchangeId]({ enableRateLimit: true });
  }
  return exchangeInstances[exchangeId];
}

router.get("/ticker/:exchange/:symbol", async (req, res) => {
  try {
    const { exchange, symbol } = req.params;
    const ex = getExchange(exchange.toLowerCase());
    const ticker = await ex.fetchTicker(symbol.replace("-", "/"));
    res.json({ symbol: ticker.symbol, last: ticker.last, bid: ticker.bid, ask: ticker.ask, high: ticker.high, low: ticker.low, volume: ticker.baseVolume, change: ticker.change, percentage: ticker.percentage });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export { router as marketRouter };
