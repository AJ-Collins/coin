import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react"; // Imported Chevrons

// TODO: replace with GET /admin/trades
const TRADES = [
  { id: "t1", user: "j.muthoni@gmail.com", symbol: "BTC/USDT", side: "buy", type: "market", price: 67842.10, qty: 0.05, status: "filled", time: "2026-06-13 11:42" },
  { id: "t2", user: "kevin.otieno@gmail.com", symbol: "ETH/USDT", side: "sell", type: "limit", price: 3421.00, qty: 1.2, status: "filled", time: "2026-06-13 11:38" },
  { id: "t3", user: "amina.hassan@gmail.com", symbol: "SOL/USDT", side: "buy", type: "market", price: 142.30, qty: 10, status: "pending", time: "2026-06-13 11:35" },
  { id: "t4", user: "brian.kip@gmail.com", symbol: "XRP/USDT", side: "sell", type: "market", price: 0.6234, qty: 5000, status: "filled", time: "2026-06-13 11:20" },
  { id: "t5", user: "linda.wanjiru@gmail.com", symbol: "BNB/USDT", side: "buy", type: "limit", price: 598.12, qty: 2, status: "cancelled", time: "2026-06-13 10:58" },
];

const statusStyles: Record<string, string> = {
  filled: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  cancelled: "bg-gray-500/15 text-gray-400",
};

const ITEMS_PER_PAGE = 10; 

export default function TradesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Track active page index

  const filtered = TRADES.filter(
    (t) => t.user.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Math Matrix
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const activePage = currentPage > totalPages ? 1 : currentPage;
  
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTrades = filtered.slice(startIndex, endIndex); // Target window slice

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Fast fallback back to page 1 during input updates
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Trades</h1>
      <p className="text-sm text-gray-400 mb-6">All platform trade activity.</p>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={handleSearchChange}
          type="text"
          placeholder="Search by user or symbol..."
          className="w-full bg-[#0d0f17] border border-[#1a1f28] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#39ff88]/40"
        />
      </div>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-[#1a1f28] text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrades.length > 0 ? (
              paginatedTrades.map((t) => (
                <tr key={t.id} className="border-b border-[#1a1f28] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{t.user}</td>
                  <td className="px-4 py-3 font-semibold text-white">{t.symbol}</td>
                  <td className={`px-4 py-3 font-bold ${t.side === "buy" ? "text-[#39ff88]" : "text-[#ff4d6d]"}`}>
                    {t.side.toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{t.type}</td>
                  <td className="px-4 py-3 text-gray-300">{t.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-300">{t.qty}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusStyles[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                  No trades found matching your search parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION PANEL FOOTER */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1f28] bg-[#090b11]">
          <div className="text-xs text-gray-400">
            Showing <span className="text-white font-medium">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="text-white font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
            <span className="text-white font-medium">{totalItems}</span> trades
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={activePage === 1}
              className="p-1.5 rounded border border-[#1a1f28] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400 px-1">
              Page <span className="text-white font-medium">{activePage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={activePage === totalPages}
              className="p-1.5 rounded border border-[#1a1f28] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}