import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import ccxt from "ccxt";
import IORedis from "ioredis";
import { setProBotBroadcaster } from "./services/botEngineService.js";

const botSubscribers = new Map<number, Set<WebSocket>>();

function sendToSubscribers(proBotId: number, payload: any) {
  const clients = botSubscribers.get(proBotId);
  if (!clients) return;
  const message = JSON.stringify(payload);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  // Redis subscriber — receives ALL broadcasts (both from API process and worker process)
  // This is the ONLY path to WebSocket clients. localBroadcast is set to a no-op below.
  const redisSub = new IORedis({
    host: process.env.REDIS_HOST || "redis",
    port: 6379,
  });

  redisSub.psubscribe("probot:*", (err) => {
    if (err) console.error("[Redis] psubscribe error:", err);
    else console.log("[Redis] Subscribed to probot:* channel");
  });

  redisSub.on("pmessage", (_pattern, channel, message) => {
    const proBotId = parseInt(channel.split(":")[1]);
    if (isNaN(proBotId)) return;
    try {
      sendToSubscribers(proBotId, JSON.parse(message));
    } catch {}
  });

  // Set localBroadcast to no-op — Redis is the single delivery path.
  // broadcast() in botEngineService always publishes to Redis,
  // and redisSub above delivers it to WS clients.
  setProBotBroadcaster(() => {});

  wss.on("connection", (ws) => {
    let tickerInterval: ReturnType<typeof setInterval> | null = null;
    let currentSubscribedBotId: number | null = null;

    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

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
                    volume: ticker.baseVolume,
                  },
                }));
              }
            } catch {}
          };
          await tick();
          tickerInterval = setInterval(tick, 5000);
        }

        if (msg.type === "subscribe_bot" && msg.proBotId) {
          const botId = Number(msg.proBotId);
          if (currentSubscribedBotId && botSubscribers.has(currentSubscribedBotId)) {
            botSubscribers.get(currentSubscribedBotId)?.delete(ws);
          }
          currentSubscribedBotId = botId;
          if (!botSubscribers.has(botId)) botSubscribers.set(botId, new Set());
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
}