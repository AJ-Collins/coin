import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import ccxt from "ccxt";
import { setProBotBroadcaster } from "./services/botEngineService";

// Store connected clients grouped by the bot ID they are monitoring
const botSubscribers = new Map<number, Set<WebSocket>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    let tickerInterval: ReturnType<typeof setInterval> | null = null;
    let currentSubscribedBotId: number | null = null;

    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // Channel 1: Public CCXT Ticker Streaming Provider
        if (msg.type === "subscribe" && msg.exchange && msg.symbol) {
          if (tickerInterval) clearInterval(tickerInterval);
          const ex = new (ccxt as any)[msg.exchange.toLowerCase()]({ enableRateLimit: true });
          
          const tick = async () => {
            try {
              const ticker = await ex.fetchTicker(msg.symbol.replace("-", "/"));
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ 
                  type: "ticker", 
                  data: { 
                    last: ticker.last, 
                    bid: ticker.bid, 
                    ask: ticker.ask, 
                    change: ticker.change, 
                    percentage: ticker.percentage, 
                    volume: ticker.baseVolume 
                  } 
                }));
              }
            } catch {}
          };
          await tick();
          tickerInterval = setInterval(tick, 5000);
        }

        // Channel 2: Live Bot Telemetry & Console Log Stream Connection
        if (msg.type === "subscribe_bot" && msg.proBotId) {
          const botId = Number(msg.proBotId);
          
          // Cleanup previous room allocation if switching targets
          if (currentSubscribedBotId && botSubscribers.has(currentSubscribedBotId)) {
            botSubscribers.get(currentSubscribedBotId)?.delete(ws);
          }

          currentSubscribedBotId = botId;
          if (!botSubscribers.has(botId)) {
            botSubscribers.set(botId, new Set());
          }
          botSubscribers.get(botId)?.add(ws);
        }
      } catch {}
    });

    ws.on("close", () => {
      if (tickerInterval) clearInterval(tickerInterval);
      if (currentSubscribedBotId && botSubscribers.has(currentSubscribedBotId)) {
        botSubscribers.get(currentSubscribedBotId)?.delete(ws);
      }
    });
  });

  // Inject the real-time broadcaster back into the Bot Engine Service layer
  setProBotBroadcaster((proBotId: number, payload: any) => {
    const clients = botSubscribers.get(proBotId);
    if (!clients) return;
    
    const message = JSON.stringify(payload);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
}