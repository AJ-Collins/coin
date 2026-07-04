import { History, CheckCircle, Clock, XCircle } from "lucide-react";

interface DepositItem {
  id: string;
  coin: string;
  network: string;
  amount: string | number;
  usdValueAtCredit: string | number | null;
  status: "CREDITED" | "PENDING" | "CONFIRMED" | "SWEPT" | "FAILED";
  txHash: string;
  createdAt: string;
}

export default function DepositHistory({ history }: { history: DepositItem[] }) {
  return (
    <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 space-y-4 w-full max-w-md mx-auto">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <History className="h-4 w-4 text-gray-400" /> Deposit History
      </h3>

      {history.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">No historical deposit records found.</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {history.map((item) => {
            const displayStatus = item.status === "SWEPT" ? "CREDITED" : item.status;
            const usd = item.usdValueAtCredit ? Number(item.usdValueAtCredit) : null;

            return (
              <div key={item.id} className="bg-[#05070a] border border-[#1a1f28] rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white">
                      {usd ? `$${usd.toFixed(2)}` : `${Number(item.amount).toFixed(6)} ${item.coin}`}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{item.coin}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                    displayStatus === "CREDITED"
                      ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                      : displayStatus === "FAILED"
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    {displayStatus === "CREDITED"
                      ? <CheckCircle className="h-4 w-4" />
                      : displayStatus === "FAILED"
                      ? <XCircle className="h-3 w-3" />
                      : <Clock className="h-3 w-3" />
                    }
                    {displayStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-500 font-mono">
                  <span className="truncate max-w-[180px]">{item.network}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}