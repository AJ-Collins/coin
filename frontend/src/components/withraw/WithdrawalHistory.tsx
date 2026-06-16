import type { Transaction } from "../../types/index";
import { CheckCircle2, Clock, XCircle, Copy } from "lucide-react";

interface HistoryProps {
  transactions: Transaction[];
}

function truncateAddress(address: string, start = 7, end = 0) {
  if (!address) return "";
  if (address.length <= start + end + 3) return address;
  return end > 0
    ? `${address.slice(0, start)}...${address.slice(-end)}`
    : `${address.slice(0, start)}...`;
}

export default function WithdrawalHistory({ transactions }: HistoryProps) {
  const handleCopyAddress = (text: string) => {
    if (text) navigator.clipboard.writeText(text);
  };

  if (transactions.length === 0) {
    return <p className="text-xs text-gray-500 py-6 text-center">No recent withdrawal activities discovered.</p>;
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-none">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="bg-[#0a0d12] border border-[#1a1f28] rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-gray-800 transition-all animate-fadeIn"
        >
          {/* Left: Icon + Amount + Address */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#1a9e6a] flex items-center justify-center text-sm font-black text-white">
              {tx.currency === "USDT" ? "T" : tx.currency.charAt(0)}
            </div>
            <div className="text-left min-w-0">
              <div className="text-[15px] font-bold text-white leading-tight">
                ${tx.amount.toFixed(2)}{" "}
                <span className="text-xs font-medium text-gray-500">({tx.currency})</span>
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-1 flex items-center gap-1 min-w-0">
                <span className="truncate">{truncateAddress(tx.address)}</span>
                <button
                  type="button"
                  onClick={() => handleCopyAddress(tx.address)}
                  className="text-gray-600 hover:text-white p-0.5 transition-colors flex-shrink-0"
                  title="Copy Address"
                >
                  <Copy className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Status + Date */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
              tx.status === "Approved" ? "bg-[#0f2a1d] text-[#39ff88]" :
              tx.status === "Pending" ? "bg-[#1a1f28] text-gray-400" : "bg-[#2a1414] text-red-400"
            }`}>
              {tx.status === "Approved" && <CheckCircle2 className="h-3 w-3" />}
              {tx.status === "Pending" && <Clock className="h-3 w-3" />}
              {tx.status === "Rejected" && <XCircle className="h-3 w-3" />}
              {tx.status}
            </span>
            <span className="text-[10px] text-gray-600 font-medium">{tx.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}