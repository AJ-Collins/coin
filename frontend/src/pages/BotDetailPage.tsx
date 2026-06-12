import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import type { Bot, Order, BotLog } from "../types";
import { Play, Square, RefreshCw, Settings } from "lucide-react";

function useMarketTicker(exchange: string, symbol: string) {
  const [ticker, setTicker] = useState<any>(null);
  useEffect(() => {
    if (!exchange || !symbol) return;
    const ws = new WebSocket("ws://localhost:4000/ws");
    ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", exchange: exchange.toLowerCase(), symbol }));
    ws.onmessage = (e) => { const msg = JSON.parse(e.data); if (msg.type === "ticker") setTicker(msg.data); };
    return () => ws.close();
  }, [exchange, symbol]);
  return ticker;
}

function Terminal({ logs }: { logs: BotLog[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  return (
    <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 12, color: "#e2e8f0", height: 300, overflowY: "auto" }}>
      <div style={{ color: "#38bdf8", marginBottom: 8, letterSpacing: 1 }}>● BOT TERMINAL</div>
      {logs.length === 0 && <div style={{ color: "#475569" }}>No logs. Start the bot to see activity.</div>}
      {logs.map(log => (
        <div key={log.id} style={{ display: "flex", gap: 12, marginBottom: 4, lineHeight: 1.6 }}>
          <span style={{ color: "#475569", whiteSpace: "nowrap" }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
          <span style={{ color: log.level === "error" ? "#f87171" : log.level === "warn" ? "#fbbf24" : "#4ade80", minWidth: 50 }}>[{log.level.toUpperCase()}]</span>
          <span>{log.message}</span>
        </div>
      ))}
      <div ref={ref} />
    </div>
  );
}

function OpenOrdersTable({ orders }: { orders: Order[] }) {
  const open = orders.filter(o => o.status === "pending");
  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 600, fontSize: 13, textAlign: "center", color: "#64748b", letterSpacing: 1 }}>OPEN ORDERS</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            {["Side","Type","Quantity","Price","Amount","Status","PnL","Opened","Filled","ID"].map(h =>
              <th key={h} style={{ padding: "9px 14px", textAlign: h === "ID" ? "right" : "left", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {open.length === 0 && <tr><td colSpan={10} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No open orders</td></tr>}
            {open.map(o => {
              const amt = o.price && o.quantity ? (o.price * o.quantity).toFixed(2) : "-";
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: o.side === "buy" ? "#16a34a" : "#dc2626" }}>{o.side.toUpperCase()}</td>
                  <td style={{ padding: "10px 14px" }}>Limit</td>
                  <td style={{ padding: "10px 14px" }}>{o.quantity} {o.symbol.split("/")[0]}</td>
                  <td style={{ padding: "10px 14px" }}>{o.price ? `${Number(o.price).toLocaleString()} USDT` : "-"}</td>
                  <td style={{ padding: "10px 14px" }}>{amt} USDT</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#dbeafe", color: "#1d4ed8" }}>Placed</span></td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8" }}>-</td>
                  <td style={{ padding: "10px 14px", color: "#64748b" }}>{new Date(o.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8" }}>-</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#94a3b8" }}>{o.id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TradesTable({ orders }: { orders: Order[] }) {
  const filled = orders.filter(o => o.status === "filled");
  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 600, fontSize: 13, color: "#64748b" }}>TRADES</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            {["Type","Quantity","Price","Amount","Status","Orders status","Created","ID"].map(h =>
              <th key={h} style={{ padding: "9px 14px", textAlign: h === "ID" ? "right" : "left", color: "#94a3b8", fontWeight: 500 }}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {filled.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No trades yet</td></tr>}
            {filled.map(o => {
              const amt = o.price && o.quantity ? (o.price * o.quantity).toFixed(2) : "-";
              const isExiting = o.side === "sell";
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "2px 10px", borderRadius: 6, background: "#f1f5f9", fontSize: 12 }}>Trade</span></td>
                  <td style={{ padding: "10px 14px" }}>{o.quantity} {o.symbol.split("/")[0]}</td>
                  <td style={{ padding: "10px 14px" }}>{o.price ? `${Number(o.price).toLocaleString()} USDT` : "-"}</td>
                  <td style={{ padding: "10px 14px" }}>{amt} USDT</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: isExiting ? "#fee2e2" : "#dcfce7", color: isExiting ? "#dc2626" : "#16a34a" }}>{isExiting ? "Exiting" : "Entering"}</span></td>
                  <td style={{ padding: "10px 14px", color: "#64748b" }}>Filled / {isExiting ? "Placed" : "Idle"}</td>
                  <td style={{ padding: "10px 14px", color: "#64748b" }}>{new Date(o.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#94a3b8" }}>{o.id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityTable({ logs }: { logs: BotLog[] }) {
  const startTime = logs[0] ? new Date(logs[0].createdAt).getTime() : null;
  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 600, fontSize: 13, color: "#64748b" }}>ACTIVITY</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr style={{ borderBottom: "1px solid #f1f5f9" }}>
          {["Action","Description","Duration","Date"].map(h =>
            <th key={h} style={{ padding: "9px 14px", textAlign: h === "Date" ? "right" : "left", color: "#94a3b8", fontWeight: 500 }}>{h}</th>
          )}
        </tr></thead>
        <tbody>
          {logs.length === 0 && <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No activity yet</td></tr>}
          {logs.map((log, i) => {
            const duration = startTime && i > 0 ? `+${new Date(log.createdAt).getTime() - startTime}ms` : "—";
            const action = log.message.toLowerCase().includes("start") ? "start" : log.message.toLowerCase().includes("stop") ? "stop" : log.message.toLowerCase().includes("filled") ? "fill" : log.level;
            return (
              <tr key={log.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                <td style={{ padding: "10px 14px", color: log.level === "error" ? "#dc2626" : "#16a34a", fontWeight: 600 }}>{action}</td>
                <td style={{ padding: "10px 14px" }}>{log.message}</td>
                <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{duration}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: "#64748b" }}>{new Date(log.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PaperPanel() {
  const qc = useQueryClient();
  const { data: balances = [] } = useQuery<any[]>({ queryKey: ["paper-balance"], queryFn: () => api.get("/paper/balance").then(r => r.data), refetchInterval: 10000 });
  const { data: config } = useQuery<any>({ queryKey: ["paper-config"], queryFn: () => api.get("/paper/config").then(r => r.data) });
  const [cfg, setCfg] = useState({ winRate: 0.65, maxLoss: 0.02, maxGain: 0.04 });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { if (config) setCfg({ winRate: config.winRate, maxLoss: config.maxLoss, maxGain: config.maxGain }); }, [config]);

  const saveConfig = useMutation({
    mutationFn: () => api.patch("/paper/config", cfg),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paper-config"] }); setShowSettings(false); }
  });

  const resetBalance = useMutation({
    mutationFn: () => api.post("/paper/balance/reset"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paper-balance"] })
  });

  const usdtBalance = balances.find(b => b.currency === "USDT")?.balance ?? 10000;
  const btcBalance  = balances.find(b => b.currency === "BTC")?.balance ?? 0;

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>📄 Paper Trading Account</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSettings(!showSettings)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}><Settings size={14} /> Settings</button>
          <button onClick={() => resetBalance.mutate()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fee2e2", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#dc2626" }}><RefreshCw size={14} /> Reset</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: showSettings ? 16 : 0 }}>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>USDT Balance</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>${Number(usdtBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>BTC Balance</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{Number(btcBalance).toFixed(6)} BTC</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Win Rate</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{((config?.winRate ?? 0.65) * 100).toFixed(0)}%</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Mode</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#6366f1" }}>🧪 Paper</div>
        </div>
      </div>

      {showSettings && (
        <div style={{ marginTop: 16, padding: 16, background: "#f8fafc", borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Paper Trading Config</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Win Rate (0–1)</label>
              <input type="number" min="0" max="1" step="0.05" value={cfg.winRate}
                onChange={e => setCfg(c => ({ ...c, winRate: Number(e.target.value) }))}
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e2e8f0", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>e.g. 0.7 = 70% wins</div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Max Gain (0–1)</label>
              <input type="number" min="0" max="1" step="0.005" value={cfg.maxGain}
                onChange={e => setCfg(c => ({ ...c, maxGain: Number(e.target.value) }))}
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e2e8f0", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>e.g. 0.04 = 4% max profit</div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Max Loss (0–1)</label>
              <input type="number" min="0" max="1" step="0.005" value={cfg.maxLoss}
                onChange={e => setCfg(c => ({ ...c, maxLoss: Number(e.target.value) }))}
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e2e8f0", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>e.g. 0.02 = 2% max loss</div>
            </div>
          </div>
          <button onClick={() => saveConfig.mutate()} style={{ marginTop: 12, padding: "8px 20px", background: "#38bdf8", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
            Save Config
          </button>
        </div>
      )}
    </div>
  );
}

export default function BotDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"orders" | "trades" | "activity">("orders");

  const { data: bot, isLoading } = useQuery<Bot>({
    queryKey: ["bot", id],
    queryFn: () => api.get(`/bots/${id}`).then(r => r.data),
    refetchInterval: 5000,
  });

  const { data: logs = [] } = useQuery<BotLog[]>({
    queryKey: ["bot-logs", id],
    queryFn: () => api.get(`/bots/${id}/logs`).then(r => r.data),
    refetchInterval: 5000,
  });

  const symbol   = bot ? `${bot.baseCurrency}/${bot.quoteCurrency}` : "";
  const exchange = bot?.exchangeAccount?.exchange ?? "";
  const ticker   = useMarketTicker(exchange, symbol);

  const startBot = useMutation({ mutationFn: () => api.patch(`/bots/${id}/start`), onSuccess: () => { qc.invalidateQueries({ queryKey: ["bot", id] }); qc.invalidateQueries({ queryKey: ["bot-logs", id] }); } });
  const stopBot  = useMutation({ mutationFn: () => api.patch(`/bots/${id}/stop`),  onSuccess: () => { qc.invalidateQueries({ queryKey: ["bot", id] }); qc.invalidateQueries({ queryKey: ["bot-logs", id] }); } });

  if (isLoading) return <div style={{ padding: 40, color: "#64748b" }}>Loading...</div>;
  if (!bot) return <div style={{ padding: 40 }}>Bot not found</div>;

  const isRunning = bot.status === "running";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{bot.name}</h1>
          <div style={{ color: "#64748b", fontSize: 14 }}>{bot.template} · {symbol} · {bot.exchangeAccount?.name}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ padding: "4px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, background: isRunning ? "#dcfce7" : "#f1f5f9", color: isRunning ? "#16a34a" : "#64748b" }}>
            {isRunning ? "● Running" : "○ Stopped"}
          </span>
          {isRunning
            ? <button onClick={() => stopBot.mutate()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#fbbf24", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}><Square size={14} /> Stop</button>
            : <button onClick={() => startBot.mutate()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#4ade80", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}><Play size={14} /> Start</button>
          }
        </div>
      </div>

      {/* Paper panel */}
      <PaperPanel />

      {/* Live ticker */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Last Price",  value: ticker ? `$${Number(ticker.last).toLocaleString()}` : "—" },
          { label: "24h Change",  value: ticker ? `${Number(ticker.percentage).toFixed(2)}%` : "—", color: ticker ? (ticker.change >= 0 ? "#16a34a" : "#dc2626") : undefined },
          { label: "Bid",         value: ticker ? `$${Number(ticker.bid).toLocaleString()}` : "—" },
          { label: "Ask",         value: ticker ? `$${Number(ticker.ask).toLocaleString()}` : "—" },
          { label: "Volume",      value: ticker ? Number(ticker.volume).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: color ?? "#0f172a" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: 16 }}>
        {(["orders", "trades", "activity"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 20px", border: "none", background: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", color: activeTab === tab ? "#38bdf8" : "#64748b", borderBottom: activeTab === tab ? "2px solid #38bdf8" : "2px solid transparent", marginBottom: -2, textTransform: "capitalize" }}>{tab}</button>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        {activeTab === "orders"   && <OpenOrdersTable orders={bot.orders ?? []} />}
        {activeTab === "trades"   && <TradesTable     orders={bot.orders ?? []} />}
        {activeTab === "activity" && <ActivityTable   logs={logs} />}
      </div>

      {/* Terminal */}
      <Terminal logs={logs} />
    </div>
  );
}
