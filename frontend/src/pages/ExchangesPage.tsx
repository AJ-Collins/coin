import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { ExchangeAccount } from "../types";
import { Plus, Trash2 } from "lucide-react";

const EXCHANGES = ["binance", "bybit", "okx", "kraken", "coinbase", "gateio", "bitget"];

export default function ExchangesPage() {
  const qc = useQueryClient();
  const { data: exchanges = [] } = useQuery<ExchangeAccount[]>({ queryKey: ["exchanges"], queryFn: () => api.get("/exchanges").then(r => r.data) });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", exchange: "binance", apiKey: "", secretKey: "", isPaper: false });

  const create = useMutation({
    mutationFn: (data: typeof form) => api.post("/exchanges", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exchanges"] }); setShowForm(false); setForm({ name: "", exchange: "binance", apiKey: "", secretKey: "", isPaper: false }); }
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/exchanges/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exchanges"] })
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Exchange Accounts</h1>
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#38bdf8", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={16} /> Add Exchange
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Add Exchange Account</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input placeholder="Account name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }} />
            <select value={form.exchange} onChange={e => setForm(f => ({ ...f, exchange: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
              {EXCHANGES.map(ex => <option key={ex}>{ex}</option>)}
            </select>
            <input placeholder="API Key" value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }} />
            <input placeholder="Secret Key" type="password" value={form.secretKey} onChange={e => setForm(f => ({ ...f, secretKey: e.target.value }))}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 14 }}>
            <input type="checkbox" checked={form.isPaper} onChange={e => setForm(f => ({ ...f, isPaper: e.target.checked }))} />
            Paper trading (no real funds)
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => create.mutate(form)} style={{ padding: "10px 20px", background: "#38bdf8", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Add</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {exchanges.map(ex => (
          <div key={ex.id} style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{ex.name}</div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{ex.exchange} · {ex.isPaper ? "Paper" : "Live"}</div>
            </div>
            <button onClick={() => remove.mutate(ex.id)} style={{ padding: "8px 10px", background: "#fee2e2", border: "none", borderRadius: 6, cursor: "pointer" }}>
              <Trash2 size={14} color="#ef4444" />
            </button>
          </div>
        ))}
        {exchanges.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No exchange accounts. Add one to connect your exchange.</div>}
      </div>
    </div>
  );
}
