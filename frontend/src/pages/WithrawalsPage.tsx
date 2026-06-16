import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NewWithdrawalForm from "../components/withraw/NewWithdrawalForm";
import WithdrawalHistory from "../components/withraw/WithdrawalHistory";
import type { Transaction } from "../types/index";
import { History } from "lucide-react";
import api from "../lib/api";

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();
  const [balance, setBalance] = useState<number>(833.95);
  const [toast, setToast] = useState<{ show: boolean; message: string } | null>(null);

  // Fetch withdrawal records using useQuery
  const { data: history = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["withdrawal-history"],
    queryFn: async () => {
      const { data } = await api.get("/api/withraw/history");
      return data;
    },
  });

  // 2. Process real backend posts using useMutation
  const withdrawMutation = useMutation({
    mutationFn: async (withdrawalData: {
      currency: string;
      network: string;
      address: string;
      amount: number;
      fee: number;
    }) => {
      const { data } = await api.post("/api/withdraw", withdrawalData);
      return data;
    },
    onSuccess: (variables) => {
      // Deduct balance locally on success
      setBalance((prev) => prev - variables.amount);

      // Force TanStack Query to refresh history from database in background
      queryClient.invalidateQueries({ queryKey: ["withdrawal-history"] });

      // Trigger success announcement banner
      setToast({
        show: true,
        message: `Your withdrawal of $${variables.amount.toFixed(2)} in ${variables.currency} is being processed`,
      });

      setTimeout(() => setToast(null), 6000);
    },
    onError: (error) => {
      console.error("Backend rejection encountered:", error);
    },
  });

  const handleWithdrawalSubmit = async (withdrawalData: {
    currency: string;
    network: string;
    address: string;
    amount: number;
    fee: number;
  }) => {
    // Fire off asynchronous mutation action hook
    await withdrawMutation.mutateAsync(withdrawalData);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-8 flex flex-col items-center justify-start space-y-4">
      
      {/* Dynamic Action Submission Banner */}
      {toast?.show && (
        <div className="w-full max-w-md bg-[#0d1712] border border-[#1a442b] rounded-xl p-4 text-left animate-slideDown">
          <h4 className="text-sm font-bold text-[#39ff88]">Withdrawal Submitted</h4>
          <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>
        </div>
      )}

      {/* Main Framework Dashboard Layout Container */}
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-3 px-1 py-2">
          <div>
            <h1 className="text-lg font-bold">Withdraw Crypto</h1>
            <p className="text-xs text-gray-400">Withdraw your cryptocurrency to an external wallet</p>
          </div>
        </div>

        {/* Form Entry Module */}
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6 relative shadow-xl">
          <NewWithdrawalForm 
            availableBalance={balance} 
            onExecuteWithdraw={handleWithdrawalSubmit} 
          />
        </div>

        {/* Historical Logs List Card */}
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-gray-400" /> 
             Withdrawal History
          </h3>
          
          {/* Managed directly via TanStack async loading status states */}
          {isLoading ? (
            <div className="text-xs text-gray-500 py-10 text-center tracking-wider animate-pulse">
              Loading history...
            </div>
          ) : (
            <WithdrawalHistory transactions={history} />
          )}
        </div>
      </div>
    </div>
  );
}