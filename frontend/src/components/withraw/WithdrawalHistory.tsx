import type { Transaction } from "../../types/index";
import { CheckCircle2, Clock, XCircle, Copy } from "lucide-react";

interface HistoryProps {
  transactions: Transaction[];
}

function truncateAddress(address: string, start = 6, end = 4) {
  if (!address) return "";
  if (address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export default function WithdrawalHistory({ transactions }: HistoryProps) {
  const handleCopyAddress = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "approved":
      case "success":
        return "bg-[#0f2a1d] text-[#a78bfa]";
      case "pending":
        return "bg-[#1a2428] text-yellow-400";
      case "rejected":
      case "failed":
        return "bg-[#2a1414] text-red-400";
      default:
        return "bg-[#1a1f28] text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "approved":
      case "success":
        return <CheckCircle2 className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "rejected":
      case "failed":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-gray-500">No withdrawal history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1 sm:pr-2 scrollbar-none">
      {transactions.map((tx) => {
        const amount = typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount;
        const date = new Date(tx.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const time = new Date(tx.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={tx.id}
            className="bg-[#0a0d12] border border-[#1a1f28] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-[#a78bfa]/30 transition-all"
          >
            {/* Left Section: Token Identity + Transfer Metadata */}
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              {/* Token Circular Icon Placeholder */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-[#1a9e6a]/15 border border-[#1a9e6a]/40 flex items-center justify-center text-xs sm:text-sm font-bold text-[#a78bfa]">
                {tx.coin.slice(0, 1).toUpperCase()}
              </div>

              {/* Data Text Stack */}
              <div className="min-w-0 flex-1">
                {/* Upper line: Values & Networks */}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-0.5">
                  <div className="font-bold text-white text-sm sm:text-base">
                    ${amount.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-gray-400 font-bold tracking-wide">
                    {tx.coin}
                  </div>
                  <div className="text-[10px] text-gray-600 font-medium bg-[#141822] px-1.5 py-0.5 rounded border border-[#1a1f28]">
                    {tx.network}
                  </div>
                </div>

                {/* Lower line: Destination Crypto Target String */}
                {tx.toAddress && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 font-mono tracking-tight">
                      {truncateAddress(tx.toAddress)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(tx.toAddress!)}
                      className="text-gray-600 hover:text-[#a78bfa] p-0.5 transition-colors flex-shrink-0"
                      title="Copy Address"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: Auditing Log States & Chronological Timestamps */}
            <div className="flex flex-row sm:flex-col justify-between sm:items-end items-center w-full sm:w-auto border-t border-[#141923] sm:border-t-0 pt-2.5 sm:pt-0 flex-shrink-0 gap-1.5">
              {/* Dynamic Badging */}
              <div
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${getStatusColor(
                  tx.status
                )}`}
              >
                {getStatusIcon(tx.status)}
                <span className="capitalize tracking-wide">{tx.status}</span>
              </div>

              {/* Timestamp Strings */}
              <div className="text-[10px] text-gray-500 flex sm:flex-col items-center sm:items-end gap-1.5 sm:gap-0 font-medium">
                <div>{date}</div>
                <span className="sm:hidden text-gray-700 font-bold">•</span>
                <div className="text-gray-500 sm:text-gray-600">{time}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}