const STEPS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    color: "cyan",
    title: "Connect your exchange",
    body: "Link Binance, Coinbase, Kraken, Bybit, or any of 15+ supported exchanges via read-only API key. Takes 90 seconds.",
    detail: "15+ exchanges supported",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    color: "amber",
    title: "Pick an AI strategy",
    body: "Choose from 500+ pre-built scalp strategies ranked by live performance, or customize one with the visual builder.",
    detail: "No coding required",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "emerald",
    title: "Let the bot trade",
    body: "The AI scans markets 24/7, fires entries in 0.3 seconds, enforces your risk limits, and sends you trade reports.",
    detail: "Fully automated",
  },
];

const colorMap = {
  cyan:   { line: "from-[#00f0ff]", badge: "bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]", num: "text-[#00f0ff]", glow: "hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:border-[#00f0ff]/50" },
  amber:  { line: "from-[#fbbf24]", badge: "bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24]", num: "text-[#fbbf24]", glow: "hover:shadow-[0_0_20px_rgba(251,191,36,0.1)] hover:border-[#fbbf24]/50" },
  emerald:{ line: "from-[#39ff88]", badge: "bg-[#39ff88]/10 border-[#39ff88]/30 text-[#39ff88]", num: "text-[#39ff88]", glow: "hover:shadow-[0_0_20px_rgba(57,255,136,0.1)] hover:border-[#39ff88]/50" },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 px-4 py-20 md:py-28 max-w-7xl mx-auto border-b border-[#1a1f28]">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-20">
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#9ca3af] border border-[#1a1f28] rounded-sm px-4 py-2 mb-8 bg-[#0a0c14]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
            HOW IT WORKS
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          <span className="text-white">From signup to</span><br />
          <span className="text-[#22d3ee] drop-shadow-md">first trade in minutes.</span>
        </h2>
        
        <p className="text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto font-light leading-relaxed">
          No coding, no complexity. Three steps to deploy and the AI handles order execution and risk limits.
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Terminal connector line — desktop only */}
        <div className="hidden md:block absolute top-14 left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px bg-gradient-to-r from-[#00f0ff]/30 via-[#fbbf24]/30 to-[#39ff88]/30 border-t border-dashed border-[#1a1f28]" />

        {STEPS.map(({ icon, color, title, body, detail }, i) => {
          const c = colorMap[color as keyof typeof colorMap];
          return (
            <div key={title} className={`relative bg-[#0a0c14] border border-[#1a1f28] rounded-sm p-6 md:p-8 transition-all duration-300 group ${c.glow}`}>
              
              {/* Terminal Step Number */}
              <div className={`absolute -top-3 left-6 px-2.5 py-0.5 bg-[#070712] border border-[#1a1f28] rounded-sm flex items-center justify-center text-[10px] font-mono tracking-widest font-bold ${c.num}`}>
                STEP {String(i + 1).padStart(2, "0")}
              </div>

              {/* Icon Container */}
              <div className={`h-14 w-14 rounded-sm border ${c.badge} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                {icon}
              </div>
              
              <h3 className="font-bold text-xl text-white mb-3 tracking-tight">{title}</h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed mb-6 font-light">{body}</p>
              
              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${c.num} flex items-center gap-1.5`}>
                {detail}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}