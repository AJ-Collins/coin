import { Link } from "react-router-dom";
import { Bot, Wallet, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

export default function WelcomeStats() {
  const { user } = useAuth();

  const { data: liveAccount } = useQuery({
    queryKey: ['accountBalance'],
    queryFn: async () => {
      const res = await api.get('/user/account/balance');
      return res.data;
    },
    refetchInterval: 10000,
    staleTime: 0,
  });

  const balance = liveAccount?.balance ?? user?.accounts?.find(a => a.type === "REAL")?.balance ?? 0;
  const currency = liveAccount?.currency ?? user?.accounts?.find(a => a.type === "REAL")?.currency ?? "USD";
  const realBalance = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(balance);

  const { data: summary } = useQuery({
    queryKey: ["market-summary-public"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=false"
      );
      const data = await response.json();
      
      // Calculate Stats from the fetched list
      const totalVolume = data.reduce((acc: number, coin: any) => acc + coin.total_volume, 0);
      const sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      
      return {
        totalVolume,
        topGainer: sorted[0],
        topLoser: sorted[sorted.length - 1]
      };
    },
    refetchInterval: 60000,
  });

  return (
    <div className="px-4 md:px-6 pt-8 pb-6 bg-gradient-to-b from-[#a78bfa]/[0.04] to-transparent">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here's the latest market overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/trade">
            <button className="flex items-center gap-2 bg-[#a78bfa] text-[#05070a] text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-[#c4b5fd]">
              <Bot className="h-6 w-6" /> Trade Now
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wallet className="h-4 w-4" />} 
          label="Total Balance"
          value={realBalance}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="24h Volume"
          value={summary ? `$${(summary.totalVolume / 1e9).toFixed(2)} B` : "—"}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-[#a78bfa]" />}
          label="Top Gainer"
          value={summary ? `${summary.topGainer.symbol.toUpperCase()} +${summary.topGainer.price_change_percentage_24h.toFixed(2)}%` : "—"}
          valueClass="text-[#a78bfa]"
        />
        <StatCard
          icon={<TrendingDown className="h-4 w-4 text-[#ff4d6d]" />}
          label="Top Loser"
          value={summary ? `${summary.topLoser.symbol.toUpperCase()} ${summary.topLoser.price_change_percentage_24h.toFixed(2)}%` : "—"}
          valueClass="text-[#ff4d6d]"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, valueClass = "text-white" }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4 min-w-0">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        {icon}
        {label}
      </div>
      <div 
        className={`text-lg md:text-2xl font-black truncate ${valueClass}`} 
        title={value}
      >
        {value}
      </div>
    </div>
  );
}