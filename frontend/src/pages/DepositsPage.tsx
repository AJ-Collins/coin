import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api"; // Your custom axios wrapper

import StepTracker from "../components/deposits/StepTracker";
import Step1Amount from "../components/deposits/Step1Amount";
import Step2Currency from "../components/deposits/Step2Currency";
import Step3Payment from "../components/deposits/Step3Payment";
import DepositHistory from "../components/deposits/DepositHistory";

export default function DepositsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(60);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [depositConfirmed, setDepositConfirmed] = useState(false);

  const { data: liveAccount } = useQuery({
    queryKey: ['accountBalance'],
    queryFn: async () => {
      const res = await api.get('/user/account/balance');
      return res.data;
    },
    staleTime: 0,
  });

  const balance = liveAccount?.balance ?? user?.accounts?.find(a => a.type === "REAL")?.balance ?? 0;
  const currency = liveAccount?.currency ?? user?.accounts?.find(a => a.type === "REAL")?.currency ?? "USD";
  const formattedBalance = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(balance);

  // 2. Query to load user historical transactions via React-Query
  const { data: history = [] } = useQuery({
    queryKey: ["deposit-history"],
    queryFn: async () => {
      const { data } = await api.get("/deposit/history");
      return data;
    },
    refetchInterval: step === 3 && !depositConfirmed ? 10000 : false,
  });

  const [depositStartedAt, setDepositStartedAt] = useState<Date | null>(null);

  const createDepositMutation = useMutation({
    mutationFn: async (payload: { amount: number; currency: string; network: string }) => {
      const { data } = await api.post("/deposit/address", {
        coin: payload.currency,
        network: payload.network,
      });
      return data;
    },
    onSuccess: (data, variables) => {
      const CRYPTO_RATES: Record<string, number> = {
        ETH: 3500, BTC: 65000, BNB: 600,
        XRP: 0.5,  USDT: 1,    USDC: 1,
      };
      const rate = CRYPTO_RATES[variables.currency] ?? 1;

      setDepositStartedAt(new Date()); // track when this session started
      setPaymentDetails({
        address: data.address,
        amountToSend: parseFloat((variables.amount / rate).toFixed(8)),
        currency: data.coin,
        network: variables.network,
        expiresInSeconds: data.expiresInSeconds ?? 3600,
      });
      setStep(3);
      queryClient.invalidateQueries({ queryKey: ["deposit-history"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to generate deposit address";
      alert(message);
    },
  });

  const [creditedDeposit, setCreditedDeposit] = useState<any>(null);

  // Detect when the latest deposit gets credited
  useEffect(() => {
    if (step !== 3 || !paymentDetails || depositConfirmed || !depositStartedAt) return;

    const credited = history.find(
      (d: any) =>
        d.coin === paymentDetails.currency &&
        d.status === "CREDITED" &&
        new Date(d.createdAt) > depositStartedAt // only deposits after this session
    );

    if (credited) {
      setCreditedDeposit(credited);
      setDepositConfirmed(true);
      queryClient.invalidateQueries({ queryKey: ["accountBalance"] });
    }
  }, [history, step, paymentDetails, depositConfirmed, depositStartedAt]);



  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Platform Screen Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-black text-white leading-none mb-1">Deposit Crypto</h1>
          <p className="text-xs text-gray-400">Deposit cryptocurrency to fund your account</p>
        </div>
      </div>

      {/* Main Core Form Card Container */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-2xl p-6 relative overflow-hidden shadow-xl">
        
        {/* Real Balance Context Header line */}
        <div className="flex justify-between items-center border-b border-[#1a1f28] pb-4 mb-2">
          <span className="text-xs font-bold text-gray-400">Current Balance</span>
          <span className="text-base font-black text-white font-mono">{formattedBalance}</span>
        </div>

        {/* Dynamic Horizontal Progress Steps component */}
        <StepTracker currentStep={step} />

        {/* Step Routing Switcher matrix */}
        {step === 1 && (
          <Step1Amount 
            initialAmount={amount} 
            onNext={(amt) => { setAmount(amt); setStep(2); }} 
          />
        )}

        {step === 2 && (
          <Step2Currency
            amount={amount}
            onBack={() => setStep(1)}
            isGenerating={createDepositMutation.isPending}
            onGenerate={(crypto, network) => {
              createDepositMutation.mutate({ amount, currency: crypto, network });
            }}
          />
        )}

        {step === 3 && paymentDetails && !depositConfirmed && (
          <Step3Payment paymentData={paymentDetails} />
        )}

        {step === 3 && depositConfirmed && (
          <div className="flex flex-col items-center gap-4 py-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#14231c] border border-[#39ff88]/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#39ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-white mb-1">Deposit Confirmed!</h2>
              <p className="text-xs text-gray-400">
                Your balance has been updated successfully.
              </p>
            </div>
            <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl px-6 py-3">
              <span className="text-[#39ff88] font-black text-xl font-mono">
                +${creditedDeposit ? Number(creditedDeposit.usdValueAtCredit).toFixed(2) : "0.00"}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">added to your account</p>
            </div>
            <button
              onClick={() => {
                setStep(1);
                setPaymentDetails(null);
                setDepositConfirmed(false);
                setDepositStartedAt(null);
                setCreditedDeposit(null);
                queryClient.invalidateQueries({ queryKey: ["deposit-history"] });
              }}
              className="w-full bg-[#39ff88] text-[#05070a] font-bold text-sm py-3 rounded-xl hover:bg-[#5dffa1] transition-colors"
            >
              Make Another Deposit
            </button>
          </div>
        )}
      </div>

      {/* Render Historical List only when on steps 1 or 2 */}
      {step < 3 && <DepositHistory history={history} />}
    </div>
  );
}