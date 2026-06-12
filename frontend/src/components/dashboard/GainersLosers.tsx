import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";

// Matches CoinGecko API structure
interface CoinGeckoMarket {
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

function Panel({ 
  title, 
  icon, 
  data, 
  positive 
}: { 
  title: string; 
  icon: React.ReactNode; 
  data: CoinGeckoMarket[]; 
  positive: boolean 
}) {
  return (
    <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
      <div className="flex items-center gap-2 font-bold text-white mb-3">
        {icon}
        {title}
      </div>
      <div className="flex flex-col gap-1">
        {data.map((t, i) => (
          <div key={t.symbol} className="flex items-center justify-between py-2 border-b border-[#1a1f28] last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-4">{i + 1}</span>
              <div>
                <div className="font-semibold text-white text-sm uppercase">{t.symbol}</div>
                <div className="text-xs text-gray-500">${t.current_price.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
              </div>
            </div>
            <span className={`text-sm font-bold ${positive ? "text-[#39ff88]" : "text-[#ff4d6d]"}`}>
              {positive ? "+" : ""}{t.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GainersLosers() {
  const { data: allMarkets = [] } = useQuery({
    queryKey: ["all-markets"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=false&price_change_percentage=24h"
      );
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Sort and slice data client-side
  const gainers = [...allMarkets]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 4);

  const losers = [...allMarkets]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 4);

  return (
    <div className="px-4 md:px-6 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel title="Top Gainers (24h)" icon={<TrendingUp className="h-4 w-4 text-[#39ff88]" />} data={gainers} positive />
      <Panel title="Top Losers (24h)" icon={<TrendingDown className="h-4 w-4 text-[#ff4d6d]" />} data={losers} positive={false} />
    </div>
  );
}