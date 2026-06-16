import { History, CheckCircle, Clock } from "lucide-react";

interface DepositItem {
  id: string;
  amount: number;
  currency: string;
  status: "FINISHED" | "PENDING" | "FAILED";
  address: string;
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
          {history.map((item) => (
            <div key={item.id} className="bg-[#05070a] border border-[#1a1f28] rounded-lg p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white">${item.amount}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                  item.status === "FINISHED" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  {item.status === "FINISHED" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {item.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-gray-500 font-mono">
                <span className="truncate max-w-[180px]">{item.address}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}