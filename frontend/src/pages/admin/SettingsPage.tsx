import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { Key, Settings, Loader2, Plus, Save, Copy, Check, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [tempConfig, setTempConfig] = useState<any>(null);

  const { data: botConfig, isLoading: configLoading } = useQuery({
    queryKey: ["botConfig"],
    queryFn: () => api.get("/admin/bot/config").then(res => res.data),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/passkeys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["passkeys"] })
  });

  useEffect(() => {
    if (botConfig) {
      setTempConfig(botConfig);
    } else {
      setTempConfig({ winRate: 0.55, avgWinPct: 0.01, avgLossPct: 0.01, payoutVarPct: 0.1 });
    }
  }, [botConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => api.put("/admin/bot/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["botConfig"] });
      alert("Saved successfully!");
    }
  });

  const generateKeyMutation = useMutation({
    mutationFn: () => api.post("/admin/passkeys", { version: "v2.1", label: "VIP License" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["passkeys"] })
  });

  const handleInputChange = (key: string, value: string) => {
    setTempConfig((prev: any) => ({ ...prev, [key]: Number(value) }));
  };

  return (
    <div className="max-w-4xl mx-auto px-2 py-4 space-y-4">
      <h1 className="text-2xl font-black text-white">Settings</h1>
      
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#39ff88]" /> Bot Tuning
        </h2>
        
        {configLoading || !tempConfig ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#39ff88]" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Win Rate (0-1)", key: "winRate", step: "0.01" },
                { label: "Avg Win Pct", key: "avgWinPct", step: "0.001" },
                { label: "Avg Loss Pct", key: "avgLossPct", step: "0.001" },
                { label: "Payout Variance", key: "payoutVarPct", step: "0.01" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-1">{field.label}</label>
                  <input 
                    type="number" step={field.step}
                    value={tempConfig[field.key] || 0}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg p-3 text-white outline-none focus:border-[#39ff88]/40 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => updateConfigMutation.mutate(tempConfig)}
                disabled={updateConfigMutation.isPending}
                className="w-full sm:w-auto bg-[#39ff88] text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#5dffa1] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {updateConfigMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} 
                Save Engine Config
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-[#39ff88]" /> Bot Passkeys
          </h2>
          <button 
            onClick={() => generateKeyMutation.mutate()}
            disabled={generateKeyMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#39ff88] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#5dffa1] disabled:opacity-50 transition-all"
          >
            {generateKeyMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />} 
            Generate New Key
          </button>
        </div>
        
        <PasskeyTable onDelete={(id) => deleteKeyMutation.mutate(id)} />
      </div>
    </div>
  );
}

function PasskeyTable({ onDelete }: { onDelete: (id: string) => void }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data: keys, isLoading } = useQuery({
    queryKey: ["passkeys"],
    queryFn: () => api.get("/admin/passkeys").then(res => res.data)
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <div className="text-gray-500 text-sm p-4">Loading keys...</div>;
  if (!keys || keys.length === 0) return <div className="text-gray-500 text-sm p-4 text-center italic">No passkeys generated yet.</div>;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="text-xs uppercase text-gray-500 border-b border-[#1a1f28]">
          <tr>
            <th className="pb-3">Code</th>
            <th className="pb-3">Version</th>
            <th className="pb-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k: any) => (
            <tr key={k.id} className="border-b border-[#1a1f28]/30">
              <td className="py-3 font-mono text-[#39ff88]">{k.code}</td>
              <td className="py-3">{k.version}</td>
              <td className="py-3 text-right flex justify-end gap-2">
                {!k.isUsed && (
                  <>
                    <button 
                      onClick={() => copyToClipboard(k.code, k.id)}
                      className="p-2 hover:bg-[#1a1f28] rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                      {copiedId === k.id ? <Check className="h-4 w-4 text-[#39ff88]" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => onDelete(k.id)}
                      className="p-2 hover:bg-red-900/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}