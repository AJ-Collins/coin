const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "emerald", // Swapped to brand green
    title: "AI Scalp Signals",
    body: "Real-time pattern recognition across 200+ indicators. Pinpoint entries delivered before the crowd sees them.",
    tag: "94.7% accuracy",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "cyan",
    title: "0.3s Execution",
    body: "Sub-second order routing on low-latency infrastructure. Scalp trades fire before the price moves away.",
    tag: "Ultra-fast",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "pink", // Swapped to brand red/pink
    title: "Risk Shield™",
    body: "Automatic stop-loss and take-profit on every trade. Hard caps mean you never blow past your daily limit.",
    tag: "99.8% protection",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "blue",
    title: "Backtesting Engine",
    body: "Replay any strategy on 10+ years of tick data. See your actual edge before you risk a dollar.",
    tag: "10yr tick data",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6v6l4 2" />
      </svg>
    ),
    color: "amber",
    title: "24/7 Autopilot",
    body: "Set your parameters once. The bot scans every market session — including the ones you're asleep for.",
    tag: "Always on",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "violet",
    title: "Copy Scalping",
    body: "Browse verified trader track records and clone their strategy in one tap. No coding, no guesswork.",
    tag: "500+ strategies",
  },
];

// Re-mapped to custom hex values for a sharper "terminal" aesthetic
const colorMap = {
  emerald:{ bg: "bg-[#39ff88]/10", border: "border-[#39ff88]/20", icon: "text-[#22d3ee]", tag: "text-[#39ff88]", glow: "hover:shadow-[0_0_20px_rgba(57,255,136,0.1)] hover:border-[#39ff88]/40" },
  cyan:   { bg: "bg-[#00f0ff]/10", border: "border-[#00f0ff]/20", icon: "text-[#22d3ee]", tag: "text-[#00f0ff]", glow: "hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:border-[#00f0ff]/40" },
  pink:   { bg: "bg-[#ff4d6d]/10", border: "border-[#ff4d6d]/20", icon: "text-[#ff4d6d]", tag: "text-[#ff4d6d]", glow: "hover:shadow-[0_0_20px_rgba(255,77,109,0.1)] hover:border-[#ff4d6d]/40" },
  blue:   { bg: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/20", icon: "text-[#3b82f6]", tag: "text-[#3b82f6]", glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:border-[#3b82f6]/40" },
  amber:  { bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/20", icon: "text-[#fbbf24]", tag: "text-[#fbbf24]", glow: "hover:shadow-[0_0_20px_rgba(251,191,36,0.1)] hover:border-[#fbbf24]/40" },
  violet: { bg: "bg-[#a855f7]/10", border: "border-[#a855f7]/20", icon: "text-[#a855f7]", tag: "text-[#a855f7]", glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:border-[#a855f7]/40" },
};

export default function Features() {
  return (
    <section id="features" className="relative z-10 px-4 py-20 md:py-28 max-w-7xl mx-auto border-b border-[#1a1f28]">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-20">
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#9ca3af] border border-[#1a1f28] rounded-sm px-4 py-2 mb-8 bg-[#0a0c14]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
            WHY AISCALPINGPRO
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          <span className="text-white">Built for traders who</span><br />
          <span className="text-[#22d3ee] drop-shadow-md">refuse to be slow.</span>
        </h2>
        
        <p className="text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto font-light leading-relaxed">
          Every feature exists to give you a measurable edge in the order book — from signal detection to trade settlement.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon, color, title, body, tag }) => {
          const c = colorMap[color as keyof typeof colorMap];
          return (
            <div
              key={title}
              className={`group relative bg-[#0a0c14] border border-[#1a1f28] rounded-sm p-6 md:p-8 transition-all duration-300 ${c.glow}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`relative h-12 w-12 rounded-sm ${c.bg} border ${c.border} flex items-center justify-center ${c.icon}`}>
                  {icon}
                </div>
                <span className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 bg-[#070712] border border-[#1a1f28] rounded-sm ${c.tag}`}>
                  {tag}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-white tracking-tight">{title}</h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed font-light">{body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}