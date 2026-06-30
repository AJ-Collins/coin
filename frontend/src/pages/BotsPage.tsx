import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import BotActivationPanel from "../components/bot/BotActivationPanel";
import ActiveBotDashboard from "../components/bot/ActiveBotDashboard";
import { Cpu } from "lucide-react";

export default function BotPage() {
  const { data: activeBot, isLoading, refetch } = useQuery({
    queryKey: ["active-bot"],
    queryFn: async () => {
      try {
        const res = await api.get("/bot/active");
        return res.data || null;
      } catch {
        return null;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Cpu className="h-6 w-6 text-[#22d3ee] animate-spin" />
        <p className="text-xs text-gray-500 font-mono">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">AI ScalpingPro Bot</h1>
        <p className="text-xs text-gray-400 mt-0.5">Deploy, tweak parameters, and monitor your trading logs.</p>
      </div>

      {!activeBot ? (
        <BotActivationPanel onActivationSuccess={refetch} />
      ) : (
        <ActiveBotDashboard bot={activeBot} onDeactivate={refetch} />
      )}
    </div>
  );
}