import { useState } from "react";
import { Search, Wallet, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"; // Imported Chevrons

// TODO: replace with GET /admin/deposits
const DEPOSITS = [
  { id: "d1", user: "j.muthoni@gmail.com", method: "USDT (TRC20)", amount: 2500, currency: "USD", status: "completed", time: "2026-06-13 11:42" },
  { id: "d2", user: "kevin.otieno@gmail.com", method: "USDT (TRC20)", amount: 10000, currency: "USD", status: "completed", time: "2026-06-13 10:15" },
  { id: "d3", user: "amina.hassan@gmail.com", method: "USDT (TRC20)", amount: 500, currency: "USD", status: "pending", time: "2026-06-13 09:50" },
  { id: "d4", user: "brian.kip@gmail.com", method: "USDT (TRC20)", amount: 1200, currency: "USD", status: "completed", time: "2026-06-12 18:30" },
  { id: "d5", user: "linda.wanjiru@gmail.com", method: "USDT (TRC20)", amount: 300, currency: "USD", status: "failed", time: "2026-06-12 16:05" },
];

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-rose-500/15 text-rose-400",
};

// Set items displayed per view
const ITEMS_PER_PAGE = 10; 

export default function DepositsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Track pagination state

  // KPI Card Aggregations (Keep these scanning the whole array context, not just the page)
  const totalCompleted = DEPOSITS.filter((d) => d.status === "completed").reduce((s, d) => s + d.amount, 0);
  const totalPending = DEPOSITS.filter((d) => d.status === "pending").reduce((s, d) => s + d.amount, 0);

  const filtered = DEPOSITS.filter((d) => d.user.toLowerCase().includes(search.toLowerCase()));

  // Pagination Math Matrix
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const activePage = currentPage > totalPages ? 1 : currentPage;
  
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDeposits = filtered.slice(startIndex, endIndex); // Window extraction

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset page on user search input
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Deposits</h1>
      <p className="text-sm text-gray-400 mb-6">All deposit transactions across the platform.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Wallet className="h-4 w-4 text-[#39ff88]" /> Total Completed
          </div>
          <div className="text-2xl font-black text-white">${totalCompleted.toLocaleString()}</div>
        </div>
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Clock className="h-4 w-4 text-[#f6ad55]" /> Pending
          </div>
          <div className="text-2xl font-black text-white">${totalPending.toLocaleString()}</div>
        </div>
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <CheckCircle2 className="h-4 w-4 text-[#7f9cf5]" /> Total Transactions
          </div>
          <div className="text-2xl font-black text-white">{DEPOSITS.length}</div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={handleSearchChange}
          type="text"
          placeholder="Search by user..."
          className="w-full bg-[#0d0f17] border border-[#1a1f28] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#39ff88]/40"
        />
      </div>

      {/* Table Container Wrapper */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[#1a1f28] text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeposits.length > 0 ? (
              paginatedDeposits.map((d) => (
                <tr key={d.id} className="border-b border-[#1a1f28] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{d.user}</td>
                  <td className="px-4 py-3 text-gray-400">{d.method}</td>
                  <td className="px-4 py-3 font-semibold text-[#39ff88]">${d.amount.toLocaleString()} {d.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusStyles[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{d.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                  No deposits found matching your search.
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
            <span className="text-white font-medium">{totalItems}</span> deposits
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