import { useState } from "react";
import type { Transaction } from "../../types/index";
import { CheckCircle2, Clock, XCircle, Copy, Check } from "lucide-react";

interface HistoryProps {
  transactions: Transaction[];
}

function truncateAddress(address: string, start = 7) {
  if (!address) return "—";
  if (address.length <= start + 3) return address;
  return `${address.slice(0, start)}...`;
}

export default function WithdrawalHistory({ transactions }: HistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500 py-12 text-center">No recent withdrawals found.</p>;
  }

  return (
    <div className="w-full space-y-1">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="w-full flex items-center justify-between gap-4 py-3 px-1 hover:bg-white/[0.02] transition-colors rounded-lg group"
        >
          {/* Left Section: Icon + Details */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-[#1a9e6a]/10 flex items-center justify-center text-sm font-bold text-[#1a9e6a]">
              {tx.coin === "USDT" ? "₮" : tx.coin.charAt(0)}
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">
                ${Number(tx.amount).toFixed(2)}
                <span className="text-xs font-normal text-gray-500 ml-1.5">{tx.coin}</span>
              </div>
              <div className="text-xs text-gray-600 font-mono mt-0.5 flex items-center gap-1.5">
                <span className="truncate">{truncateAddress(tx.toAddress || "")}</span>
                {tx.toAddress && (
                  <button
                    type="button"
                    onClick={() => handleCopy(tx.id, tx.toAddress!)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all flex-shrink-0"
                  >
                    {copiedId === tx.id
                      ? <Check className="h-3 w-3 text-[#39ff88]" />
                      : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Status + Date */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <span
              className={`text-[10px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1 whitespace-nowrap ${
                tx.status === "APPROVED" || tx.status === "COMPLETED"
                  ? "bg-[#1a9e6a]/10 text-[#1a9e6a]"
                  : tx.status === "REJECTED"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {(tx.status === "APPROVED" || tx.status === "COMPLETED") && <CheckCircle2 className="h-3 w-3" />}
              {tx.status === "PENDING" && <Clock className="h-3 w-3" />}
              {tx.status === "REJECTED" && <XCircle className="h-3 w-3" />}
              {tx.status === "COMPLETED" ? "Completed" : tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
            </span>
            <span className="text-[10px] text-gray-600 whitespace-nowrap">
              {new Date(tx.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}