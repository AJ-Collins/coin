import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NewWithdrawalForm from "../components/withraw/NewWithdrawalForm";
import WithdrawalHistory from "../components/withraw/WithdrawalHistory";
import KYCStatus from "../components/withraw/KYCStatus";
import type { Transaction, KYCStatus as KYCStatusType } from "../types/index";
import { History, AlertCircle } from "lucide-react";
import api from "../lib/api";

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();
  const [kycStatus, setKycStatus] = useState<string>("UNVERIFIED");
  const [showKyc, setShowKyc] = useState(false); // only revealed when user attempts withdrawal unverified
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
  });

  // Fetch KYC status quietly in the background so we know it before the user ever clicks Withdraw
  useQuery<KYCStatusType>({
    queryKey: ["kyc-status"],
    queryFn: async () => {
      const { data } = await api.get("/kyc/status");
      setKycStatus(data.kycStatus);
      return data;
    },
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<Transaction[]>({
    queryKey: ["withdrawal-history"],
    queryFn: async () => {
      const { data } = await api.get("/withdraw/history");
      return data;
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (withdrawalData: {
      accountId: string;
      amount: number;
      coin: string;
      network: string;
      toAddress: string;
    }) => {
      const { data } = await api.post("/withdraw/request", withdrawalData);
      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-history"] });
      setToast({
        show: true,
        type: "success",
        message: `Withdrawal request submitted! ID: ${response.withdrawalId}. Amount: $${response.amount}`,
      });
      setTimeout(() => setToast(null), 6000);
    },
    onError: (error: any) => {
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.error || "Withdrawal request failed",
      });
      console.error("Withdrawal error:", error);
    },
  });

  const handleWithdrawalSubmit = async (withdrawalData: {
    accountId: string;
    amount: number;
    coin: string;
    network: string;
    toAddress: string;
  }) => {
    await withdrawMutation.mutateAsync(withdrawalData);
  };

  const primaryAccount = userProfile?.accounts?.[0];

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-8 flex flex-col items-center justify-start space-y-6">      
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-3 px-1 py-2">
          <div>
            <h1 className="text-2xl font-bold">Withdraw Crypto</h1>
            <p className="text-sm text-gray-400">
              Withdraw your cryptocurrency to an external wallet
            </p>
          </div>
        </div>

        {/* Withdrawal Form — always visible */}
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Withdrawal Request
          </h2>
          <NewWithdrawalForm
            kycStatus={kycStatus}
            accountId={primaryAccount?.id || "default"}
            onExecuteWithdraw={handleWithdrawalSubmit}
            onKycRequired={() => setShowKyc(true)}
          />
        </div>

        {/* KYC Verification — only appears once user tries to withdraw while unverified */}
        {showKyc && kycStatus !== "VERIFIED" && kycStatus !== "NOT_REQUIRED" && (
          <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6 shadow-xl animate-slideDown">
            <div className="flex items-start gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Identity Verification Required
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Complete KYC before you can withdraw funds.
                </p>
              </div>
            </div>
            <KYCStatus onStatusChange={setKycStatus} />
          </div>
        )}

        {toast?.show && (
          <div
            className={`w-full max-w-2xl rounded-xl p-4 border animate-slideDown ${
              toast.type === "success"
                ? "bg-[#0d1712] border-[#1a442b]"
                : "bg-[#1a0d0d] border-[#441a1a]"
            }`}
          >
            <h4
              className={`text-sm font-bold ${
                toast.type === "success" ? "text-[#39ff88]" : "text-red-400"
              }`}
            >
              {toast.type === "success" ? "Withdrawal Submitted" : "Error"}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>
          </div>
        )}

        {/* Withdrawal History */}
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
            <History className="h-4 w-4 text-gray-400" />
            Withdrawal History
          </h3>

          {historyLoading ? (
            <div className="text-xs text-gray-500 py-10 text-center tracking-wider animate-pulse">
              Loading withdrawal history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-400 mb-2">No withdrawals yet</div>
              <p className="text-xs text-gray-500">
                Your withdrawal history will appear here
              </p>
            </div>
          ) : (
            <WithdrawalHistory transactions={history} />
          )}
        </div>
      </div>
    </div>
  );
}