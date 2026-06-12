import { useState } from "react";

const FAQS = [
  {
    q: "Is AIscalpingPro suitable for beginners?",
    a: "Absolutely. We offer paper trading with $10,000 in virtual funds, step-by-step tutorials, and pre-built scalp strategies that need zero configuration. Most beginners make their first paper trade within 5 minutes.",
  },
  {
    q: "Which exchanges do you support?",
    a: "Binance, Coinbase, Kraken, Bybit, OKX, KuCoin, and 10+ more. We add new exchanges monthly based on community votes.",
  },
  {
    q: "How is my API key protected?",
    a: "We use AES-256 encryption at rest and in transit, enforce IP whitelisting, and never request withdrawal permissions. AIscalpingPro is SOC 2 Type II certified.",
  },
  {
    q: "What is the signal accuracy based on?",
    a: "94.7% is the live win-rate measured across all signals fired in the past 90 days, across all users and pairs. Raw data is available in your dashboard under Analytics.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#0a0c14] border border-[#1a1f28] rounded-sm transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 md:p-6 flex justify-between items-center gap-4 cursor-pointer group"
      >
        <span className="font-bold text-white text-sm md:text-base tracking-wide group-hover:text-[#00f0ff] transition-colors">
          {q}
        </span>
        
        {/* Terminal Toggle Box */}
        <div className={`flex-shrink-0 h-6 w-6 border rounded-sm flex items-center justify-center transition-all duration-200 ${
          open 
            ? "bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff]" 
            : "border-[#1a1f28] text-[#5f6470] bg-[#070712] group-hover:border-[#9ca3af]/40 group-hover:text-white"
        }`}>
          {open ? (
            /* Minus Icon */
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M20 12H4" />
            </svg>
          ) : (
            /* Plus Icon */
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </div>
      </button>

      {/* Accordion Content Container */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-48 border-t border-[#1a1f28]/60 bg-[#070712]/50" : "max-h-0"
        }`}
      >
        <div className="p-5 md:p-6 font-light text-[#9ca3af] text-sm leading-relaxed border-l-2 border-[#00f0ff]">
          {a}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative z-10 px-4 py-20 md:py-28 max-w-4xl mx-auto border-b border-[#1a1f28]">
      
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#9ca3af] border border-[#1a1f28] rounded-sm px-4 py-2 mb-8 bg-[#0a0c14]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24]" />
            KNOWLEDGE BASE // FAQ
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          <span className="text-white">Frequently asked</span><br />
          <span className="text-[#fbbf24] drop-shadow-md">queries, resolved.</span>
        </h2>
        
        <p className="text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto font-light leading-relaxed">
          Technical specifications, infrastructure capabilities, and deployment architecture details.
        </p>
      </div>

      {/* Accordion List wrapper */}
      <div className="space-y-3">
        {FAQS.map((item) => (
          <FAQItem key={item.q} {...item} />
        ))}
      </div>
      
    </section>
  );
}