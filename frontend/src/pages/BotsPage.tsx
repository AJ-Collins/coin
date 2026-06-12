import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api";
import type { Bot, ExchangeAccount } from "../types";
import { Plus, Play, Square, Trash2 } from "lucide-react";

const TEMPLATES = ["grid", "dca", "rsi"];

export default function BotsPage() {
  const qc = useQueryClient();
  const { data: bots = [] } = useQuery<Bot[]>({ queryKey: ["bots"], queryFn: () => api.get("/bots").then(r => r.data) });
  const { data: exchanges = [] } = useQuery<ExchangeAccount[]>({ queryKey: ["exchanges"], queryFn: () => api.get("/exchanges").then(r => r.data) });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", template: "grid", baseCurrency: "BTC", quoteCurrency: "USDT", exchangeAccountId: "" });

  const createBot = useMutation({
    mutationFn: (data: typeof form) => api.post("/bots", { ...data, settings: {} }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bots"] }); setShowForm(false); }
  });

  const startBot = useMutation({
    mutationFn: (id: number) => api.patch(`/bots/${id}/start`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] })
  });

  const stopBot = useMutation({
    mutationFn: (id: number) => api.patch(`/bots/${id}/stop`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] })
  });

  const deleteBot = useMutation({
    mutationFn: (id: number) => api.delete(`/bots/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] })
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Bots</h1>
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#38bdf8", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={16} /> New Bot
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Create Bot</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input placeholder="Bot name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }} />
            <select value={form.template} onChange={e => setForm(f => ({ ...f, template: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
              {TEMPLATES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={form.exchangeAccountId} onChange={e => setForm(f => ({ ...f, exchangeAccountId: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <option value="">Select exchange</option>
              {exchanges.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
            <input placeholder="Base (e.g. BTC)" value={form.baseCurrency} onChange={e => setForm(f => ({ ...f, baseCurrency: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }} />
            <input placeholder="Quote (e.g. USDT)" value={form.quoteCurrency} onChange={e => setForm(f => ({ ...f, quoteCurrency: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => createBot.mutate(form)} style={{ padding: "10px 20px", background: "#38bdf8", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Create</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {bots.map(bot => (
          <div key={bot.id} style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Link to={`/bots/${bot.id}`} style={{ fontWeight: 600, fontSize: 16, color: "#0f172a", textDecoration: "none" }}>{bot.name}</Link>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{bot.template} · {bot.baseCurrency}/{bot.quoteCurrency} · {bot.exchangeAccount?.name}</div>
            </div>
            <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: bot.status === "running" ? "#dcfce7" : "#f1f5f9", color: bot.status === "running" ? "#16a34a" : "#64748b" }}>
              {bot.status}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {bot.status === "stopped"
                ? <button onClick={() => startBot.mutate(bot.id)} style={{ padding: "8px 14px", background: "#4ade80", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Play size={14} /> Start</button>
                : <button onClick={() => stopBot.mutate(bot.id)} style={{ padding: "8px 14px", background: "#fbbf24", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Square size={14} /> Stop</button>
              }
              <button onClick={() => deleteBot.mutate(bot.id)} style={{ padding: "8px 10px", background: "#fee2e2", border: "none", borderRadius: 6, cursor: "pointer" }}><Trash2 size={14} color="#ef4444" /></button>
            </div>
          </div>
        ))}
        {bots.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No bots yet. Create one to get started.</div>}
      </div>
    </div>
  );
}
