import { useState, useEffect } from "react";
import { Copy, Check, Clock } from "lucide-react";

interface Step3Props {
  paymentData: {
    address: string;
    amountToSend: number;
    currency: string;
    network: string;
    expiresInSeconds: number;
  };
}

export default function Step3Payment({ paymentData }: Step3Props) {
  const [timeLeft, setTimeLeft] = useState(paymentData.expiresInSeconds);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, type: "amount" | "address") => {
    navigator.clipboard.writeText(text);
    if (type === "amount") {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  return (
    <div className="space-y-5 text-center animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Complete Payment</h2>
        <p className="text-xs text-gray-400">Send crypto to the address below via {paymentData.network}</p>
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-between bg-[#05070a] border border-[#1a1f28] rounded-xl px-4 py-3">
        <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-500" /> Time Remaining
        </span>
        <span className="font-mono font-bold text-sm text-amber-400">
          {timeLeft > 0 ? formatTime(timeLeft) : "EXPIRED"}
        </span>
      </div>

      {/* Send Exactly block */}
      <div className="text-left space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Send Exactly</label>
        <div className="flex items-center justify-between bg-[#05070a] border border-[#1a1f28] rounded-xl px-4 py-3">
          <span className="font-mono font-bold text-[#39ff88]">{paymentData.amountToSend} {paymentData.currency}</span>
          <button onClick={() => copyToClipboard(paymentData.amountToSend.toString(), "amount")} className="text-gray-500 hover:text-white transition-colors">
            {copiedAmount ? <Check className="h-4 w-4 text-[#39ff88]" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[10px] text-amber-400/80 leading-snug">
          * Copy and send the exact amount or your deposit won't be processed automatically.
        </p>
      </div>

      {/* Target Wallet address block */}
      <div className="text-left space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">To This Address</label>
        <div className="flex items-center justify-between bg-[#05070a] border border-[#1a1f28] rounded-xl px-4 py-3 gap-2">
          <span className="font-mono text-xs text-gray-300 break-all select-all">{paymentData.address}</span>
          <button onClick={() => copyToClipboard(paymentData.address, "address")} className="text-gray-500 hover:text-white flex-shrink-0 transition-colors">
            {copiedAddress ? <Check className="h-4 w-4 text-[#39ff88]" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Dynamically rendered QR code area matching image structure */}
      <div className="bg-white rounded-xl p-4 w-44 h-44 mx-auto flex items-center justify-center shadow-lg">
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${paymentData.address}`}
          alt="Payment QR Address"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}