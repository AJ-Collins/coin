import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, ResponsiveContainer, ReferenceLine } from "recharts";

interface CoinGeckoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
}

export default function TrendingAssets() {
  const { data: assets = [] } = useQuery({
    queryKey: ["trending-assets"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&sparkline=true&price_change_percentage=24h"
      );
      if (!response.ok) throw new Error("Failed to fetch market data");
      return response.json();
    },
    refetchInterval: 30000,
  });

  return (
    <div className="px-3 md:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Trending Assets</h2>
      </div>

      {/* Changed grid-cols-1 to grid-cols-2 for mobile two-column layout */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {assets.map((a: CoinGeckoAsset) => {
          const up = a.price_change_percentage_24h >= 0;
          const chartData = a.sparkline_in_7d.price.map((v, i) => ({ i, v }));
          const color = up ? "#39ff88" : "#ff4d6d";

          return (
            <div
              key={a.id}
              className="block bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-3 sm:p-4 hover:border-[#39ff88]/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <div className="mb-2 sm:mb-0">
                  <div className="font-bold text-white uppercase text-sm sm:text-base">{a.symbol}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 truncate">{a.name}</div>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded w-max ${up ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                  {up ? "+" : ""}{a.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>

              <div className="h-10 sm:h-12 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`gradient-${a.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <ReferenceLine y={chartData[0]?.v} stroke="#1a1f28" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={color}
                      strokeWidth={2}
                      fill={`url(#gradient-${a.id})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <span className="text-xs sm:text-base font-bold text-white">
                  ${a.current_price.toLocaleString(undefined, { maximumFractionDigits: a.current_price < 1 ? 4 : 2 })}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-0">
                  Vol: ${(a.total_volume / 1e9).toFixed(1)}B
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}