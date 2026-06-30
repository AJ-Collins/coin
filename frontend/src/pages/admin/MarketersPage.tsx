import { useState } from "react";
import { MoreVertical, Megaphone, Loader2, Percent } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

const statusStyles: Record<string, string> = {
  ACTIVE:    "bg-emerald-500/15 text-emerald-400",
  SUSPENDED: "bg-rose-500/15 text-rose-400",
};

interface Marketer {
  id: string;
  email: string;
  status: string;
  referralRate: number;
  referrals: number;
  earnings: number;
  accountBalance: number;
  currency: string;
  createdAt: string;
}

export default function MarketersPage() {
  const queryClient = useQueryClient();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [rateModal, setRateModal] = useState<Marketer | null>(null);
  const [rateValue, setRateValue] = useState("");
  const [amountModal, setAmountModal] = useState<{ withdrawalId: string; currentAmount: number } | null>(null);
  const [amountValue, setAmountValue] = useState("");

  const { data: marketers = [], isLoading } = useQuery({
    queryKey: ["admin-marketers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/marketers");
      return data as Marketer[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-marketer-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/marketers/stats");
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-marketers"] });
    queryClient.invalidateQueries({ queryKey: ["admin-marketer-stats"] });
  };

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
    onSuccess: invalidate,
  });

  const updateRateMutation = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      api.patch(`/admin/marketers/${id}/rate`, { referralRate: rate }),
    onSuccess: () => { invalidate(); setRateModal(null); },
  });

  const updateAmountMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post(`/admin/marketers/${id}/payout`, { amount }),
    onSuccess: () => { invalidate(); setAmountModal(null); },
  });

  const openRateModal = (m: Marketer) => {
    setRateModal(m);
    setRateValue(String(m.referralRate));
    setActiveMenuId(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Marketers</h1>
      <p className="text-sm text-gray-400 mb-6">Manage marketer accounts and referral performance.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Megaphone className="h-4 w-4 text-[#f6ad55]" /> Total Marketers
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.total ?? marketers.length}
          </div>
        </div>
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-2">Total Referrals</div>
          <div className="text-2xl font-black text-white">
            {stats?.totalReferrals?.toLocaleString() ?? "—"}
          </div>
        </div>
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-2">Total Payouts</div>
          <div className="text-2xl font-black text-[#39ff88]">
            {stats
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.totalEarnings)
              : "—"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl overflow-x-auto min-h-[600px]">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[#1a1f28] text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Referrals</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">App Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1f28]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-[#1a1f28] rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : marketers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                  No marketers found.
                </td>
              </tr>
            ) : (
              marketers.map((m) => (
                <tr key={m.id} className="border-b border-[#1a1f28] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{m.email}</td>
                  <td className="px-4 py-3 text-gray-300">{m.referrals.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-300">{m.referralRate}%</td>
                  <td className="px-4 py-3 text-[#39ff88] font-semibold">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: m.currency }).format(m.accountBalance)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusStyles[m.status] ?? statusStyles.ACTIVE}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === m.id ? null : m.id)}
                      className="text-gray-500 hover:text-white p-1"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenuId === m.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-4 mt-1 w-48 bg-[#090b11] border border-[#1a1f28] rounded-lg shadow-xl py-1 z-20 text-left">
                          <button
                            onClick={() => openRateModal(m)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
                          >
                            <Percent className="h-3.5 w-3.5 text-blue-400" /> Set Referral Rate
                          </button>
                          <button
                            onClick={() => {
                              setAmountModal({ withdrawalId: m.id, currentAmount: m.accountBalance });
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
                          >
                            <span className="h-3.5 w-3.5 text-emerald-400">$</span> Update App Balance
                          </button>
                          <button
                            onClick={() => { toggleStatusMutation.mutate(m.id); setActiveMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
                          >
                            <span className={`h-2 w-2 rounded-full ${m.status === 'ACTIVE' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                            {m.status === 'ACTIVE' ? 'Suspend' : 'Unsuspend'}
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rate Modal */}
      {rateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0f17] border border-[#1a1f28] w-full max-w-sm rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Set Referral Rate</h3>
            <p className="text-xs text-gray-400">
              Updating rate for <span className="text-white font-medium">{rateModal.email}</span>
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={rateValue}
                onChange={e => setRateValue(e.target.value)}
                className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRateModal(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={() => updateRateMutation.mutate({ id: rateModal.id, rate: parseFloat(rateValue) })}
                disabled={updateRateMutation.isPending}
                className="bg-[#39ff88] text-[#05070a] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#5dffa1] flex items-center gap-2 disabled:opacity-50"
              >
                {updateRateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {amountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0f17] border border-[#1a1f28] w-full max-w-sm rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Update Withdrawal Amount</h3>
            <p className="text-xs text-gray-400">
              Current amount: <span className="text-white font-medium">${amountModal.currentAmount}</span>
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                New Amount (USD)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amountValue}
                onChange={e => setAmountValue(e.target.value)}
                className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setAmountModal(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={() => updateAmountMutation.mutate({ id: amountModal.withdrawalId, amount: parseFloat(amountValue) })}
                disabled={updateAmountMutation.isPending || !amountValue || parseFloat(amountValue) <= 0}
                className="bg-[#39ff88] text-[#05070a] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#5dffa1] flex items-center gap-2 disabled:opacity-50"
              >
                {updateAmountMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Update Amount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}