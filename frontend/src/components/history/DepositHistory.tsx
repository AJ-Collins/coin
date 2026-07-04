import { useState } from "react";
import type { Transaction } from "../../types/index";
import { CheckCircle2, Clock, XCircle, Copy, Check } from "lucide-react";

interface HistoryProps {
  transactions: Transaction[];
}

function truncateHash(hash: string, start = 7, end = 4) {
  if (!hash) return "—";
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

export default function DepositHistory({ transactions }: HistoryProps) {
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
    return <p className="text-sm text-gray-500 py-12 text-center">No recent deposits found.</p>;
  }

  return (
    <div className="w-full space-y-1">
      {transactions.map((tx) => {
        const displayStatus = tx.status === "SWEPT" ? "CREDITED" : tx.status;
        const usd = tx.usdValueAtCredit ? Number(tx.usdValueAtCredit) : null;

        return (
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
                  {usd ? `$${usd.toFixed(2)}` : `${Number(tx.amount).toFixed(6)}`}
                  <span className="text-xs font-normal text-gray-500 ml-1.5">{tx.coin}</span>
                </div>
                <div className="text-xs text-gray-600 font-mono mt-0.5 flex items-center gap-1.5">
                  <span className="truncate">{truncateHash(tx.txHash || "")}</span>
                  {tx.txHash && (
                    <button
                      type="button"
                      onClick={() => handleCopy(tx.id, tx.txHash!)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all flex-shrink-0"
                    >
                      {copiedId === tx.id
                        ? <Check className="h-3 w-3 text-[#a78bfa]" />
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
                  displayStatus === "CREDITED"
                    ? "bg-[#1a9e6a]/10 text-[#1a9e6a]"
                    : displayStatus === "FAILED"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {displayStatus === "CREDITED" ? (
                  <><CheckCircle2 className="h-3 w-3" /> Credited</>
                ) : displayStatus === "FAILED" ? (
                  <><XCircle className="h-3 w-3" /> Failed</>
                ) : (
                  <><Clock className="h-3 w-3" /> Pending</>
                )}
              </span>
              <span className="text-[10px] text-gray-600 whitespace-nowrap">
                {new Date(tx.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}