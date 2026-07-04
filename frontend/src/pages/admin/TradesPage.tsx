import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, TrendingUp, ArrowLeftRight, Percent, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-violet-500/15 text-violet-400",
  RUNNING:   "bg-amber-500/15 text-amber-400",
  STOPPED:   "bg-gray-500/15 text-gray-400",
};

const ITEMS_PER_PAGE = 10;

interface Trade {
  id: string;
  user: string;
  asset: string;
  type: string;
  stake: number;
  payout: number;
  profit: number;
  entryPrice: number;
  exitPrice: number;
  status: string;
  startTime: string;
  endTime: string | null;
  createdAt: string;
}

export default function TradesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    clearTimeout((window as any)._tradeSearchTimer);
    (window as any)._tradeSearchTimer = setTimeout(() => {
      setDebouncedSearch(e.target.value);
    }, 400);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-trades", debouncedSearch, currentPage],
    queryFn: async () => {
      const { data } = await api.get("/admin/trades", {
        params: {
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });
      return data as { trades: Trade[]; total: number; totalPages: number; page: number };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-trade-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/trades/stats");
      return data;
    },
    refetchInterval: 30000,
  });

  const trades = data?.trades ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Trades</h1>
      <p className="text-sm text-gray-400 mb-6">All platform trade activity.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Trades",
            value: stats?.total?.toLocaleString() ?? "—",
            icon: ArrowLeftRight,
            color: "text-[#a78bfa]",
          },
          {
            label: "Today",
            value: stats?.todayCount?.toLocaleString() ?? "—",
            icon: TrendingUp,
            color: "text-[#7f9cf5]",
          },
          {
            label: "Win Rate",
            value: stats ? `${stats.winRate}%` : "—",
            icon: Percent,
            color: "text-[#f6ad55]",
          },
          {
            label: "Total P&L",
            value: stats
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.totalProfit)
              : "—",
            icon: DollarSign,
            color: stats?.totalProfit >= 0 ? "text-[#a78bfa]" : "text-[#ff4d6d]",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Icon className={`h-4 w-4 ${color}`} />
              {label}
            </div>
            <div className={`text-xl md:text-2xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={handleSearchChange}
          type="text"
          placeholder="Search by user or asset..."
          className="w-full bg-[#0d0f17] border border-[#1a1f28] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#a78bfa]/40"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-[#1a1f28] text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Stake</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">P&L</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1f28]">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-[#1a1f28] rounded animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : trades.length > 0 ? (
              trades.map((t) => (
                <tr key={t.id} className="border-b border-[#1a1f28] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white text-xs truncate max-w-[140px]">{t.user}</td>
                  <td className="px-4 py-3 font-semibold text-white">{t.asset}</td>
                  <td className={`px-4 py-3 font-bold text-xs ${t.type === "WIN" ? "text-[#a78bfa]" : "text-[#ff4d6d]"}`}>
                    {t.type}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    ${t.stake.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    ${t.payout.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${t.profit >= 0 ? "text-[#a78bfa]" : "text-[#ff4d6d]"}`}>
                    {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusStyles[t.status] ?? statusStyles.STOPPED}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                  No trades found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1f28] bg-[#090b11]">
          <div className="text-xs text-gray-400">
            Showing{" "}
            <span className="text-white font-medium">
              {totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="text-white font-medium">
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            of <span className="text-white font-medium">{totalItems}</span> trades
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-[#1a1f28] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400 px-1">
              Page <span className="text-white font-medium">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-[#1a1f28] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}