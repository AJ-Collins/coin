import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Square, Play, Trash2, Layers, Percent, DollarSign, Activity, Sliders, Terminal, Bot } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ActiveBotProps {
  bot: { id: number; name: string; version: string; description: string; status: string; settings?: any };
  onDeactivate: () => void;
}

const INTERVAL_OPTIONS = [
  { label: "30 Seconds", value: "30" },
  { label: "1 Minute", value: "60" },
  { label: "2 Minutes", value: "120" },
  { label: "3 Minutes", value: "180" },
  { label: "4 Minutes", value: "240" },
  { label: "5 Minutes", value: "300" },
];

const ASSET_OPTIONS = [
  { label: "GBP/JPY", value: "GBP/JPY", flags: ["https://flagcdn.com/w40/gb.png", "https://flagcdn.com/w40/jp.png"] },
  { label: "XAU/USD", value: "XAU/USD", flags: ["https://cdn-icons-png.flaticon.com/512/2933/2933116.png", "https://flagcdn.com/w40/us.png"] },
  { label: "BTC/USD", value: "BTC/USD", flags: ["https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg", "https://flagcdn.com/w40/us.png"] },
  { label: "EUR/USD", value: "EUR/USD", flags: ["https://flagcdn.com/w40/eu.png", "https://flagcdn.com/w40/us.png"] },
  { label: "USD/JPY", value: "USD/JPY", flags: ["https://flagcdn.com/w40/us.png", "https://flagcdn.com/w40/jp.png"] },
  { label: "GBP/USD", value: "GBP/USD", flags: ["https://flagcdn.com/w40/gb.png", "https://flagcdn.com/w40/us.png"] },
  { label: "AUD/USD", value: "AUD/USD", flags: ["https://flagcdn.com/w40/au.png", "https://flagcdn.com/w40/us.png"] },
  { label: "USD/CAD", value: "USD/CAD", flags: ["https://flagcdn.com/w40/us.png", "https://flagcdn.com/w40/ca.png"] },
  { label: "USD/CHF", value: "USD/CHF", flags: ["https://flagcdn.com/w40/us.png", "https://flagcdn.com/w40/ch.png"] },
  { label: "NZD/USD", value: "NZD/USD", flags: ["https://flagcdn.com/w40/nz.png", "https://flagcdn.com/w40/us.png"] },
];

export default function ActiveBotDashboard({ bot, onDeactivate }: ActiveBotProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(bot.status);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0); // Top mini progress
  const WS_URL = import.meta.env.VITE_WS_URL;
  const [open, setOpen] = useState(false);
  const [intervalOpen, setIntervalOpen] = useState(false);
  const assetDropdownRef = useRef<HTMLDivElement>(null);
  const intervalDropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Local state for system metrics
  const [settings, setSettings] = useState({
    tradeAmount: bot.settings?.tradeAmount || "10",
    tradeInterval: bot.settings?.tradeInterval || "30",
    tradingAsset: bot.settings?.tradingAsset || "EUR/USD"
  });

  // AI Core Real-time States
  const [timeLeft, setTimeLeft] = useState(parseInt(settings.tradeInterval));
  const [aiPhase, setAiPhase] = useState("Initializing neural matrix...");

  // Server-synced progress state (anchors to the backend's real elapsed time)
  const [serverElapsed, setServerElapsed] = useState(0);
  const [serverInterval, setServerInterval] = useState(parseInt(settings.tradeInterval));
  const lastProgressMsgAt = useRef(Date.now());

  const selectedAsset = ASSET_OPTIONS.find(a => a.value === settings.tradingAsset);
  const selectedInterval = INTERVAL_OPTIONS.find(opt => opt.value === settings.tradeInterval) || INTERVAL_OPTIONS[0];

  // Instant stats from websocket "bot" broadcasts (bypasses the 3s poll)
  const [liveBotData, setLiveBotData] = useState<{ tradeCount: number; wins: number; profit: number; balance: number } | null>(null);
  // Snapshot taken when a run starts, used to compute the session's own P&L on stop
  const [sessionStart, setSessionStart] = useState<{ profit: number; balance: number } | null>(null);
  const [lastSessionResult, setLastSessionResult] = useState<{ pnl: number; balance: number } | null>(null);

  // Fetch live stats from the backend
  const { data: statsData } = useQuery({
    queryKey: ['botStats', bot.id],
    queryFn: async () => {
      const res = await api.get(`/bot/${bot.id}/stats`);
      return res.data;
    },
    refetchInterval: status === "running" ? 3000 : false,
  });

  const liveStats = statsData || { executions: 0, winRate: 0, pnl: 0, balance: 0 };

  // Prefer instant websocket data when available, fall back to the polled query
  const displayStats = liveBotData
    ? {
        executions: liveBotData.tradeCount,
        winRate: liveBotData.tradeCount > 0 ? ((liveBotData.wins / liveBotData.tradeCount) * 100).toFixed(1) : "0.0",
        pnl: liveBotData.profit,
        balance: liveBotData.balance,
      }
    : liveStats;

  useEffect(() => {
    ASSET_OPTIONS.forEach((opt) => {
      opt.flags.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, []);

  // Top header rapid progress cycle
  useEffect(() => {
    if (status !== "running") {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1));
    }, 600); 
    return () => clearInterval(interval);
  }, [status]);

  // AI CORE: Progress synced to server, interpolated smoothly between broadcasts
  useEffect(() => {
    if (status !== "running") return;

    const timer = setInterval(() => {
      const msSinceLastMsg = Date.now() - lastProgressMsgAt.current;
      const interpolatedElapsed = serverElapsed + msSinceLastMsg / 1000;
      const remaining = Math.max(0, serverInterval - interpolatedElapsed);
      setTimeLeft(Math.ceil(remaining));
    }, 200);

    return () => clearInterval(timer);
  }, [status, serverElapsed, serverInterval]);

  // AI CORE: Dynamic Status Jargon
  useEffect(() => {
    if (status !== "running") return;
    const phrases = [
      "Calculating Order Flow Imbalance (OFI)...",
      "Monitoring Dark Pool liquidity sweeps...",
      "Running Mean Reversion optimization...",
      "Validating Support/Resistance confluence...",
      "Analyzing Gamma Exposure (GEX) levels...",
      "Calibrating Bollinger Band breakout signals...",
      "Scanning institutional block trade volume...",
      "Adjusting Delta-Neutral hedge parameters...",
      "Syncing micro-latency across ECN nodes...",
      "Identifying VWAP divergence markers..."
    ];
    const phraseTimer = setInterval(() => {
      setAiPhase(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 3500);
    
    return () => clearInterval(phraseTimer);
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(target)) setOpen(false);
      if (intervalDropdownRef.current && !intervalDropdownRef.current.contains(target)) setIntervalOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle WebSocket telemetry
  useEffect(() => {
    if (!WS_URL || status !== "running") return;
    
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ 
        type: "subscribe_bot", 
        proBotId: bot.id 
      }));
      
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [SYSTEM] AI Bot started.`
      ]);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.message_type === "log") {
        setLogs((prev) => [...prev.slice(-30), data.log]);
      } else if (data.message_type === "bot") {
        const d = data.data;
        if (d) {
          setLiveBotData({
            tradeCount: d.tradeCount,
            wins: d.wins,
            profit: d.profit,
            balance: d.balance,
          });

          if (d?.balance !== undefined) {
            queryClient.setQueryData(['accountBalance'], {
              balance: d.balance,
              currency: "USD"
            });
          }
        }
        if (d?.status === "STOPPED") {
          setStatus("stopped");
          setSessionStart((start) => {
            if (start && d) {
              setLastSessionResult({
                pnl: d.profit - start.profit,
                balance: d.balance,
              });
            }
            return start;
          });
        }
      } else if (data.message_type === "progress") {
        // Re-anchor local interpolation to the server's real elapsed time
        setServerElapsed(data.data.elapsed);
        setServerInterval(data.data.interval);
        lastProgressMsgAt.current = Date.now();
      }
    };

    return () => {
      ws.close();
    };
  }, [status, bot.id, WS_URL]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const toggleStatusMutation = useMutation({
    mutationFn: async (targetStatus: string) => {
      if (targetStatus === "running") {
        await api.patch(`/bot/${bot.id}/settings`, { settings });
      }
      return api.post(`/bot/${bot.id}/toggle/status`, { status: targetStatus });
    },
    onSuccess: (_, variables) => {
      setStatus(variables);
      if (variables === "running") {
        setServerElapsed(0);
        setServerInterval(parseInt(settings.tradeInterval));
        lastProgressMsgAt.current = Date.now();
        setLastSessionResult(null);
        setSessionStart({
          profit: Number(liveStats.pnl) || 0,
          balance: Number(liveStats.balance) || 0,
        });
      }
      setLogs((prev) => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] Bot ${variables.toUpperCase()}.`
      ]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/bot/${bot.id}`),
    onSuccess: () => onDeactivate()
  });

  // Calculate the real percentage of the interval loop, based on server-synced interval
  const totalIntervalSeconds = serverInterval || parseInt(settings.tradeInterval);
  const realProgressPercentage = Math.max(0, Math.min(100, ((totalIntervalSeconds - timeLeft) / totalIntervalSeconds) * 100));

  return (
    <div className="space-y-4 text-left">
      
      {/* Configuration Settings Box */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Sliders className="h-4 w-4 text-[#39ff88]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Bot Settings</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Amount ($)</label>
            <input
              type="number"
              value={settings.tradeAmount}
              onChange={(e) => setSettings({ ...settings, tradeAmount: e.target.value })}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-[#39ff88]/30"
            />
          </div>

          <div className="relative" ref={intervalDropdownRef}>
            <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Interval</label>
            <button
              type="button"
              onClick={() => { setIntervalOpen(!intervalOpen); setOpen(false); }}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-xl px-3 py-2.5 flex items-center justify-between text-xs text-white hover:border-[#39ff88]/30 transition-colors"
            >
              <span>{selectedInterval.label}</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${intervalOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {intervalOpen && (
              <div className="absolute z-50 mt-2 w-full bg-[#0d0f17] border border-[#1a1f28] rounded-xl max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#39ff88]/30 scrollbar-track-transparent">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSettings({ ...settings, tradeInterval: opt.value }); setIntervalOpen(false); }}
                    className={`w-full px-3 py-3 text-left text-xs transition-colors ${settings.tradeInterval === opt.value ? "bg-[#14231c] text-[#39ff88]" : "text-white hover:bg-[#141922]"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={assetDropdownRef}>
            <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Assets</label>
            <button
              type="button"
              onClick={() => { setOpen(!open); setIntervalOpen(false); }}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-xl px-3 py-2.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-7 h-4">
                  <img src={selectedAsset?.flags[0]} className="absolute left-0 w-4 h-4 rounded-full object-cover border border-[#0d0f17]" alt="flag" />
                  <img src={selectedAsset?.flags[1]} className="absolute left-3 w-4 h-4 rounded-full object-cover border border-[#0d0f17]" alt="flag" />
                </div>
                <span className="text-sm text-white">{selectedAsset?.label}</span>
              </div>
              <span className="text-gray-500">
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {open && (
              <div className="absolute z-50 mt-2 w-full bg-[#0d0f17] border border-[#1a1f28] rounded-xl max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#39ff88]/30 scrollbar-track-transparent">
                {ASSET_OPTIONS.map((asset) => (
                  <button
                    key={asset.value}
                    type="button"
                    onClick={() => { setSettings({ ...settings, tradingAsset: asset.value }); setOpen(false); }}
                    className="w-full px-3 py-3 flex items-center gap-3 hover:bg-[#141922]"
                  >
                    <div className="relative w-7 h-4">
                      <img src={asset.flags[0]} className="absolute left-0 w-4 h-4 rounded-full object-cover border border-[#0d0f17]" alt="flag" />
                      <img src={asset.flags[1]} className="absolute left-3 w-4 h-4 rounded-full object-cover border border-[#0d0f17]" alt="flag" />
                    </div>
                    <span className="text-xs text-white">{asset.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#14231c] border border-[#1e3b2c] flex items-center justify-center flex-shrink-0">
              <Bot className="h-7 w-7 text-[#39ff88]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{bot.name}</h4>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status === "running" ? "bg-[#39ff88]" : "bg-gray-500"}`} />
                  <span className="text-[10px] text-gray-500 font-mono">
                    {status === "running" ? "ACTIVE" : "STOPPED"}
                  </span>
                </div>
                {status !== "running" && lastSessionResult && (
                  <span className={`text-[12px] font-mono font-bold ${lastSessionResult.pnl >= 0 ? "text-[#39ff88]" : "text-red-400"}`}>
                    {lastSessionResult.pnl >= 0
                      ? `${lastSessionResult.pnl.toFixed(2)} Profit`
                      : `${Math.abs(lastSessionResult.pnl).toFixed(2)} Loss`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col flex-1 max-w-xs mx-4">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-500">System Link</span>
              <span className="text-[#39ff88]">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#05070a] overflow-hidden">
              <div className="h-full bg-[#39ff88] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => toggleStatusMutation.mutate(status === "running" ? "stopped" : "running")}
              className={`h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${status === "running" ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-[#39ff88] text-[#05070a] hover:bg-[#5dffa1]"}`}
            >
              {status === "running" ? <><Square className="h-3.5 w-3.5 fill-current" /> Stop</> : <><Play className="h-3.5 w-3.5 fill-current" /> Start</>}
            </button>
            <button onClick={() => deleteMutation.mutate()} className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#05070a] border border-[#1a1f28] text-gray-500 hover:text-red-400 hover:border-red-500/20 transition-all">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Matrix Cards - Optimized for Mobile */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {[
          { label: "Executions", value: displayStats.executions.toString(), icon: Layers, color: "text-white" },
          { label: "Win Rate", value: `${displayStats.winRate}%`, icon: Percent, color: "text-[#39ff88]" },
          { label: "Profit PnL", value: `${Number(displayStats.pnl) < 0 ? "-" : ""}$${Math.abs(Number(displayStats.pnl)).toFixed(2)}`, icon: DollarSign, color: Number(displayStats.pnl) < 0 ? "text-red-400" : "text-[#39ff88]" },       
           
        ].map((card, idx) => (
          <div key={idx} className="bg-[#0d0f17] border border-[#1a1f28] rounded-lg sm:rounded-xl p-2 sm:p-3 text-center space-y-0.5 sm:space-y-1 overflow-hidden">
            <span className="text-[9.5px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tight sm:tracking-wide block truncate">{card.label}</span>
            <span className={`text-[12px] sm:text-sm font-black block truncate ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* AI NEURAL ENGINE CORE (Appears ONLY when Running) */}
      {status === "running" && (
        <div className="relative bg-[#0d0f17] border border-[#39ff88]/30 rounded-2xl p-4 overflow-hidden shadow-[0_0_15px_rgba(57,255,136,0.05)]">
          {/* Subtle animated background glow */}
          <div className="absolute inset-0 bg-[#39ff88]/5 animate-pulse pointer-events-none" />
          
          {/* Top Bar: Title & Countdown */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Using a target icon to show precision scalping */}
              <Activity className="w-6 h-6 text-[#39ff88] animate-pulse" />
              <h3 className="text-[11px] font-black tracking-[0.2em] text-[#39ff88] uppercase">
                AI Bot Scalping Market
              </h3>
            </div>
            <div className="flex items-center gap-1.5 bg-[#05070a] px-2 py-1 rounded-md border border-[#1a1f28]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#39ff88] animate-ping" />
              <span className="text-[10px] font-mono text-[#39ff88]">CYCLE: {timeLeft}s</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="relative space-y-1.5">
            <div className="flex justify-between items-end text-[10px] uppercase font-bold">
              <span className="text-gray-400 truncate pr-4">{aiPhase}</span>
              <span className="text-white font-mono">{realProgressPercentage.toFixed(0)}%</span>
            </div>
            
            {/* High-Tech Progress Bar */}
            <div className="h-2 w-full bg-[#05070a] rounded-full overflow-hidden border border-[#1a1f28]">
              <div 
                className="h-full bg-gradient-to-r from-[#14231c] via-[#39ff88] to-[#ffffff] relative transition-all duration-1000 ease-linear"
                style={{ width: `${realProgressPercentage}%` }}
              >
                {/* Simulated bright leading edge */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px] opacity-75" />
              </div>
            </div>
          </div>

          {/* AI Metrics Grid */}
            <div className="relative grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1a1f28]/50 text-center">
              <div>
                <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-0.5">Sharpe Ratio</span>
                <span className="text-[11px] font-bold text-white">2.41</span>
              </div>
              <div>
                <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-0.5">Market Bias</span>
                <span className="text-[11px] font-bold text-[#39ff88] flex items-center justify-center gap-1">
                  BULLISH
                </span>
              </div>
              <div>
                <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-0.5">Exp. Value</span>
                <span className="text-[11px] font-bold text-white flex items-center justify-center gap-0.5">
                  <Bot className="w-3 h-3 text-[#39ff88]" />
                  +$4.82/trade
                </span>
              </div>
            </div>
        </div>
      )}

      {/* Output Console Logs */}
      <div className="space-y-2">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-[#39ff88]" />
            Live AI Terminal
          </span>
          {status === "running" && (
            <span className="flex items-center gap-1.5 text-[9px] text-[#39ff88] uppercase font-bold tracking-widest animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-[#39ff88] shadow-[0_0_8px_#39ff88]" />
              Running
            </span>
          )}
        </div>

        {/* Terminal Window */}
        <div className="relative w-full bg-[#030407] border border-[#1a1f28] rounded-xl overflow-hidden shadow-2xl">
          
          {/* Fake OS Window Controls */}
          <div className="bg-[#0d0f17] border-b border-[#1a1f28] px-3 py-2 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>

          {/* Terminal Body */}
          <div className="p-4 h-70 overflow-y-auto font-mono text-[11px] space-y-1 scrollbar-thin scrollbar-thumb-[#1a1f28] scrollbar-track-transparent text-left">
            {logs.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-[#39ff88]/50">{">"}</span>
                <span className="italic">Bot standing by... waiting for engagement.</span>
              </div>
            ) : (
              logs.map((log, index) => {
                // Logic to style logs based on content
                const isExecution = log.includes("[EXECUTION]");
                const isRisk = log.includes("[RISK]");
                const isSystem = log.includes("[SYSTEM]");
                
                return (
                  <div key={index} className="flex gap-2 px-1 py-0.5 group">
                    <span className="text-gray-600 shrink-0">{">"}</span>
                    <span className={`break-all ${
                      isExecution ? "text-[#39ff88]" : 
                      isRisk ? "text-orange-400" : 
                      isSystem ? "text-blue-400" : 
                      "text-gray-400"
                    }`}>
                      {log}
                    </span>
                  </div>
                );
              })
            )}
            
            {/* Blinking Cursor */}
            {status === "running" && (
              <div className="flex items-center gap-2 px-1 pt-1">
                <span className="text-[#39ff88]/50">{">"}</span>
                <span className="w-1.5 h-3 bg-[#39ff88] animate-pulse" />
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}