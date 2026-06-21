import { useState } from "react";
import { Search, Wallet, Clock, CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, Copy, Check, XCircle, ArrowUpRight, PlusCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

const statusStyles: Record<string, string> = {
  CREDITED:  "bg-emerald-500/15 text-emerald-400",
  SWEPT:     "bg-blue-500/15 text-blue-400",
  PENDING:   "bg-amber-500/15 text-amber-400",
  CONFIRMED: "bg-yellow-500/15 text-yellow-400",
  FAILED:    "bg-rose-500/15 text-rose-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  CREDITED:  <CheckCircle2 className="h-3 w-3" />,
  SWEPT:     <ArrowUpRight className="h-3 w-3" />,
  PENDING:   <Clock className="h-3 w-3" />,
  CONFIRMED: <Clock className="h-3 w-3" />,
  FAILED:    <XCircle className="h-3 w-3" />,
};

const ITEMS_PER_PAGE = 10;

interface Deposit {
  id: string;
  user: string;
  coin: string;
  network: string;
  amount: number;
  usdValue: number;
  status: string;
  txHash: string;
  sweptTx: string | null;
  sweptAt: string | null;
  address: string;
  creditedAt: string | null;
  createdAt: string;
}

function truncate(str: string, len = 10) {
  if (!str) return "—";
  if (str.length <= len) return str;
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-gray-600 hover:text-white transition-colors ml-1"
    >
      {copied ? <Check className="h-3 w-3 text-[#39ff88]" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export default function AdminDepositsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [manualModal, setManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ txHash: '', usdValue: '' });
  const [manualResult, setManualResult] = useState<any>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    clearTimeout((window as any)._depositSearchTimer);
    (window as any)._depositSearchTimer = setTimeout(() => {
      setDebouncedSearch(e.target.value);
    }, 400);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-deposits", debouncedSearch, currentPage],
    queryFn: async () => {
      const { data } = await api.get("/admin/deposits", {
        params: {
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });
      return data as { deposits: Deposit[]; total: number; totalPages: number };
    },
    refetchInterval: 15000,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-deposit-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/deposits/stats");
      return data;
    },
    refetchInterval: 15000,
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/deposits/${id}/retry`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["admin-deposit-stats"] });
      setRetryingId(null);
    },
    onError: (e: any) => {
      alert(e?.response?.data?.error || "Retry failed");
      setRetryingId(null);
    },
  });

  const deposits = data?.deposits ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const manualCreditMutation = useMutation({
    mutationFn: (data: { txHash: string; usdValue: string }) =>
      api.post('/admin/deposits/credit', {
        txHash: data.txHash.trim(),
        usdValue: parseFloat(data.usdValue),
      }),
    onSuccess: (res) => {
      setManualResult(res.data);
      setManualError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["admin-deposit-stats"] });
    },
    onError: (e: any) => {
      setManualError(e?.response?.data?.error || 'Manual credit failed');
      setManualResult(null);
    },
  });

  const resetModal = () => {
    setManualModal(false);
    setManualForm({ txHash: '', usdValue: '' });
    setManualResult(null);
    setManualError(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Deposits</h1>
      <p className="text-sm text-gray-400 mb-6">All deposit transactions and sweep status.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Volume", value: stats ? `$${Number(stats.totalVolume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—", icon: Wallet, color: "text-[#39ff88]" },
          { label: "Pending", value: stats?.pending ?? "—", icon: Clock, color: "text-[#f6ad55]" },
          { label: "Credited", value: stats?.credited ?? "—", icon: CheckCircle2, color: "text-[#7f9cf5]" },
          { label: "Failed", value: stats?.failed ?? "—", icon: XCircle, color: "text-[#ff4d6d]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Icon className={`h-4 w-4 ${color}`} /> {label}
            </div>
            <div className={`text-xl md:text-2xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Sweep Progress Banner */}
      {stats && stats.credited > 0 && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-300">
              <span className="text-white font-bold">{stats.credited}</span> deposits credited,{" "}
              <span className="text-white font-bold">{stats.swept}</span> swept to hot wallet
            </span>
          </div>
          <div className="text-xs text-gray-500">Sweeper runs every 2 min</div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={handleSearchChange}
            type="text"
            placeholder="Search by user email..."
            className="w-full bg-[#0d0f17] border border-[#1a1f28] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#39ff88]/40"
          />
        </div>
        <button
          onClick={() => setManualModal(true)}
          className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-bold text-xs px-3 py-2 rounded-lg transition whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4" />
          Credit
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl overflow-x-auto min-h-[800px]">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[#1a1f28] text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Coin / Network</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">USD Value</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tx Hash</th>
              <th className="px-4 py-3">Sweep Tx</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1f28]">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-[#1a1f28] rounded animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : deposits.length > 0 ? (
              deposits.map((d) => (
                <tr key={d.id} className="border-b border-[#1a1f28] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white text-xs truncate max-w-[130px]">{d.user}</td>
                  <td className="px-4 py-3">
                    <div className="text-white font-semibold text-xs">{d.coin}</div>
                    <div className="text-gray-500 text-[10px]">{d.network}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {d.amount.toFixed(6)} {d.coin}
                  </td>
                  <td className="px-4 py-3 text-[#39ff88] font-semibold text-xs">
                    ${d.usdValue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 w-fit ${statusStyles[d.status] ?? statusStyles.PENDING}`}>
                      {statusIcons[d.status]}
                      {d.status === 'SWEPT' ? 'SWEPT ✓' : d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                    <div className="flex items-center">
                      {truncate(d.txHash)}
                      {d.txHash && <CopyButton text={d.txHash} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                    {d.sweptTx ? (
                      <div className="flex items-center">
                        <span className="text-blue-400">{truncate(d.sweptTx)}</span>
                        <CopyButton text={d.sweptTx} />
                      </div>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {(d.status === 'FAILED' || d.status === 'PENDING') && (
                      <button
                        onClick={() => { setRetryingId(d.id); retryMutation.mutate(d.id); }}
                        disabled={retryMutation.isPending && retryingId === d.id}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${retryMutation.isPending && retryingId === d.id ? 'animate-spin' : ''}`} />
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500 text-sm">
                  No deposits found.
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
            of <span className="text-white font-medium">{totalItems}</span> deposits
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
      {manualModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0f17] border border-[#1a1f28] w-full max-w-sm rounded-xl p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Manual Deposit Credit</h3>
              <p className="text-xs text-gray-400 mt-1">
                Enter the tx hash and USD value. The system will look up the address, coin and user automatically.
              </p>
            </div>

            {/* Success result */}
            {manualResult && !manualResult.alreadyCredited && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-1">
                <p className="text-xs text-emerald-400 font-bold">{manualResult.message}</p>
                <div className="text-[11px] text-gray-400 space-y-0.5 font-mono">
                  <p>User: <span className="text-white">{manualResult.details?.userId}</span></p>
                  <p>Coin: <span className="text-white">{manualResult.details?.coin}</span></p>
                  <p>Network: <span className="text-white">{manualResult.details?.network}</span></p>
                  <p>Amount: <span className="text-white">{manualResult.details?.amountCrypto} {manualResult.details?.coin}</span></p>
                </div>
              </div>
            )}

            {manualResult?.alreadyCredited && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-400">
                ⚠ {manualResult.message}
              </div>
            )}

            {manualError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">
                {manualError}
              </div>
            )}

            {!manualResult && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Transaction Hash
                  </label>
                  <input
                    type="text"
                    placeholder="0xb5f206db4aee..."
                    value={manualForm.txHash}
                    onChange={e => setManualForm(f => ({ ...f, txHash: e.target.value }))}
                    className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#39ff88]/40"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">Copy from Etherscan / BSCscan</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    USD Value to Credit
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="175.00"
                      value={manualForm.usdValue}
                      onChange={e => setManualForm(f => ({ ...f, usdValue: e.target.value }))}
                      className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg pl-6 pr-3 py-2 text-xs text-white outline-none focus:border-[#39ff88]/40"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">USD equivalent at time of deposit</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={resetModal} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                {manualResult ? 'Close' : 'Cancel'}
              </button>
              {!manualResult && (
                <button
                  onClick={() => manualCreditMutation.mutate(manualForm)}
                  disabled={
                    manualCreditMutation.isPending ||
                    !manualForm.txHash.trim() ||
                    !manualForm.usdValue ||
                    Number(manualForm.usdValue) <= 0
                  }
                  className="bg-amber-500 text-[#05070a] font-bold text-sm px-4 py-2 rounded-lg hover:bg-amber-400 flex items-center gap-2 disabled:opacity-50"
                >
                  {manualCreditMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {manualCreditMutation.isPending ? 'Looking up tx...' : 'Credit Deposit'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}