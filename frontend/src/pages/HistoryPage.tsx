import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "../types/index";
import DepositHistory from "../components/history/DepositHistory";
import WithdrawalHistory from "../components/history/WithdrawalHistory";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import api from "../lib/api";

type HistoryTab = "deposits" | "withdrawals";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>("deposits");

  // Fetch Deposits
  const { data: deposits = [], isLoading: isDepositsLoading } = useQuery<Transaction[]>({
    queryKey: ["deposit-history"],
    queryFn: async () => {
      const { data } = await api.get("/api/deposit/history");
      return data;
    },
  });

  // Fetch Withdrawals
  const { data: withdrawals = [], isLoading: isWithdrawalsLoading } = useQuery<Transaction[]>({
    queryKey: ["withdrawal-history"],
    queryFn: async () => {
      const { data } = await api.get("/api/withraw/history");
      return data;
    },
  });

  // Determine the active loading state depending on which tab is highlighted
  const isCurrentTabLoading = activeTab === "deposits" ? isDepositsLoading : isWithdrawalsLoading;

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-md space-y-5">
        
        {/* Page Header Segment */}
        <div className="text-left px-1">
          <h1 className="text-xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track and audit your system funding balances</p>
        </div>

        {/* Tab Selection Filter Switch Container */}
        <div className="bg-[#0d0f17] border border-[#1a1f28] p-1.5 rounded-xl flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("deposits")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "deposits"
                ? "bg-[#1a1f28] text-[#39ff88] shadow-inner"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
            Deposits
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("withdrawals")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "withdrawals"
                ? "bg-[#1a1f28] text-[#39ff88] shadow-inner"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
            Withdrawals
          </button>
        </div>

        {/* Main Content Render Box */}
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-5 shadow-2xl relative">
          {isCurrentTabLoading ? (
            <div className="text-xs text-gray-500 py-16 text-center tracking-wider animate-pulse">
              Loading history...
            </div>
          ) : activeTab === "deposits" ? (
            <DepositHistory transactions={deposits} />
          ) : (
            <WithdrawalHistory transactions={withdrawals} />
          )}
        </div>

      </div>
    </div>
  );
}