interface StepTrackerProps {
  currentStep: number;
}

export default function StepTracker({ currentStep }: StepTrackerProps) {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              currentStep >= step
                ? "bg-[#a78bfa] text-[#05070a] shadow-[0_0_12px_rgba(167,139,250,0.2)]"
                : "bg-[#1a1f28] text-gray-500 border border-[#252b38]"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-[2px] ml-3 transition-all duration-300 ${
                currentStep > step ? "bg-[#a78bfa]" : "bg-[#1a1f28]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}