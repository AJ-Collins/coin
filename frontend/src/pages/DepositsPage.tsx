import { useState } from "react";
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
  const [amount, setAmount] = useState(200);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // 1. Calculate Real Balance safely from context payload
  const realAccount = user?.accounts?.find((acc) => acc.type === "REAL");
  const formattedBalance = realAccount
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: realAccount.currency || "USD" }).format(realAccount.balance)
    : "$0.00";

  // 2. Query to load user historical transactions via React-Query
  const { data: history = [] } = useQuery({
    queryKey: ["deposit-history"],
    queryFn: async () => {
      const { data } = await api.get("/api/deposit/history");
      return data;
    },
  });

  // 3. Mutation to invoke the backend and create a new wallet target
  const createDepositMutation = useMutation({
    mutationFn: async (payload: { amount: number; currency: string; network: string }) => {
      const { data } = await api.post("/api/deposits/create", payload);
      return data; // Expected shape: { address, amountToSend, currency, network, expiresInSeconds }
    },
    onSuccess: (data) => {
      setPaymentDetails(data);
      setStep(3); // Route to the payment details screen
      queryClient.invalidateQueries({ queryKey: ["deposit-history"] });
    },
    onError: () => {
      alert("Failed to generate deposit transaction parameter structures.");
    }
  });

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

        {step === 3 && paymentDetails && (
          <Step3Payment paymentData={paymentDetails} />
        )}
      </div>

      {/* Render Historical List only when on steps 1 or 2 */}
      {step < 3 && <DepositHistory history={history} />}
    </div>
  );
}