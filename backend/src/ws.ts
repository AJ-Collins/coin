import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import ccxt from "ccxt";

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    let interval: ReturnType<typeof setInterval> | null = null;
    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "subscribe" && msg.exchange && msg.symbol) {
          if (interval) clearInterval(interval);
          const ex = new (ccxt as any)[msg.exchange.toLowerCase()]({ enableRateLimit: true });
          const tick = async () => {
            try {
              const ticker = await ex.fetchTicker(msg.symbol.replace("-", "/"));
              if (ws.readyState === WebSocket.OPEN)
                ws.send(JSON.stringify({ type: "ticker", data: { last: ticker.last, bid: ticker.bid, ask: ticker.ask, change: ticker.change, percentage: ticker.percentage, volume: ticker.baseVolume } }));
            } catch {}
          };
          await tick();
          interval = setInterval(tick, 5000);
        }
      } catch {}
    });
    ws.on("close", () => { if (interval) clearInterval(interval); });
  });
}
