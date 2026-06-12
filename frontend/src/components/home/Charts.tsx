const TIME_FRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];

export default function Charts() {
  return (
    <section id="charts" className="relative z-10 px-4 py-20 md:py-28 max-w-7xl mx-auto border-b border-[#1a1f28]">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-20">
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#9ca3af] border border-[#1a1f28] rounded-sm px-4 py-2 mb-8 bg-[#0a0c14]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff]" />
            LIVE CHARTS
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          <span className="text-white">Pro-grade charts with</span><br />
          <span className="text-[#00f0ff] drop-shadow-md">AI layered on top.</span>
        </h2>
        
        <p className="text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto font-light leading-relaxed">
          Candlestick, Renko, Heikin Ashi — with live scalp entry and exit zones painted directly by the model.
        </p>
      </div>

      {/* Terminal Chart Window */}
      <div className="bg-[#0a0c14] border border-[#1a1f28] rounded-sm overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.05)]">
        
        {/* Chart toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-[#1a1f28] bg-[#070712]">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-sm bg-[#1a1f28] flex items-center justify-center border border-[#1a1f28]/50">
                {/* Bitcoin SVG Icon */}
                <svg className="h-4 w-4 text-[#f7931a]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.4 7.65c-.23-1.52-1.74-1.95-3.52-2.33v-1.9h-1.8v1.85c-.46-.11-.94-.22-1.42-.32v-1.85h-1.8v1.9c-.4.09-.8.19-1.18.28l-.34-1.37s-1.48.36-1.45.35c-.81.2-1.05.71-1.05.71l.6 2.4s.2-.05.32-.08c.5-.12.82.04.97.58l1.45 5.84c.05.15-.03.35-.18.49-.13.12-.35.15-.35.15l-1 2.37s1.39-.33 1.45-.35c.46-.11.91-.22 1.37-.32v1.89h1.8v-1.93c.5.11 1 .22 1.48.33v1.92h1.8v-1.9c2.31.42 4.05.25 4.56-1.84.41-1.68-.2-2.6-1.28-3.21.91-.21 1.6-.82 1.76-2.1zM11 15.55c-1.55-.38-2.5-.1-2.5-.1l.8-3.2s.93.1 2.48.49c1.07.27 1.42 1.14 1.25 1.83-.16.71-.85 1.25-2.03.98zm.75-4.52c-1.4-.35-2.18-.08-2.18-.08l.73-2.92s.78.07 2.18.42c.98.24 1.34.92 1.21 1.51-.14.61-.75 1.31-1.94 1.07z"/>
                </svg>
              </div>
              <span className="font-bold text-white text-sm tracking-wide">BTC/USDT</span>
            </div>
            <span className="text-[#39ff88] text-sm font-mono font-bold">$67,842.10</span>
            <span className="text-[#39ff88] text-xs bg-[#39ff88]/10 border border-[#39ff88]/20 px-2 py-0.5 rounded-sm font-mono">
              +4.23%
            </span>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex gap-1 flex-wrap bg-[#070712] border border-[#1a1f28] p-0.5 rounded-sm">
            {TIME_FRAMES.map((tf) => (
              <button
                key={tf}
                className={`text-[10px] font-mono tracking-widest px-3 py-1.5 rounded-sm transition-colors ${
                  tf === "15m"
                    ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                    : "text-[#5f6470] border border-transparent hover:text-white hover:bg-[#1a1f28]/50"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Chart area */}
        <div className="relative h-56 sm:h-72 md:h-[400px] p-4 bg-[#0a0c14]"
          style={{
            backgroundImage: "linear-gradient(#1a1f28 1px, transparent 1px), linear-gradient(90deg, #1a1f28 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 800 280" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Grid lines inside SVG for perfect scaling */}
            {[60, 120, 180, 220].map((y) => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#1a1f28" strokeWidth="1" />
            ))}

            {/* Area fill */}
            <polygon
              fill="url(#chartFill)"
              points="0,200 50,185 100,210 160,165 210,145 260,155 310,120 360,130 420,100 470,85 530,105 570,65 620,55 670,75 710,50 760,42 800,38 800,280 0,280"
            />

            {/* Price line */}
            <polyline
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              filter="url(#glow)"
              points="0,200 50,185 100,210 160,165 210,145 260,155 310,120 360,130 420,100 470,85 530,105 570,65 620,55 670,75 710,50 760,42 800,38"
            />

            {/* BUY signal */}
            <circle cx="310" cy="120" r="5" fill="#39ff88" stroke="#0a0c14" strokeWidth="2" />
            <rect x="272" y="90" width="36" height="18" rx="2" fill="#39ff88" opacity="0.9" />
            <text x="290" y="103" fill="#05070a" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">BUY</text>

            {/* SELL signal */}
            <circle cx="620" cy="55" r="5" fill="#ff4d6d" stroke="#0a0c14" strokeWidth="2" />
            <rect x="582" y="26" width="38" height="18" rx="2" fill="#ff4d6d" opacity="0.9" />
            <text x="601" y="39" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">SELL</text>

            {/* Horizontal zone line */}
            <line x1="0" y1="100" x2="800" y2="100" stroke="#39ff88" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
          </svg>

          {/* AI overlay badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-sm px-3 py-2 text-[10px] font-mono tracking-widest text-[#00f0ff] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_5px_#00f0ff]" />
            AI SCALP OVERLAY
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-[#070712]/90 border border-[#1a1f28] rounded-sm px-3 py-2 text-[10px] font-mono text-[#9ca3af] backdrop-blur-sm uppercase tracking-wider">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#39ff88]" />Entry</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#ff4d6d]" />Exit</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 border-t border-[#1a1f28] bg-[#070712]">
          {[
            { label: "Open", val: "$65,120", cls: "text-white" },
            { label: "High", val: "$68,450", cls: "text-[#39ff88]" },
            { label: "Low", val: "$64,800", cls: "text-[#ff4d6d]" },
            { label: "Volume", val: "24.8K", cls: "text-white" },
            { label: "RSI", val: "62.3", cls: "text-[#00f0ff]" },
            { label: "AI Edge", val: "87/100", cls: "text-[#fbbf24]" },
          ].map(({ label, val, cls }) => (
            <div key={label} className="text-center px-4 py-4 border-r border-[#1a1f28] last:border-r-0 hover:bg-[#1a1f28]/30 transition-colors">
              <span className="block text-[10px] font-mono text-[#5f6470] mb-1.5 uppercase tracking-widest">{label}</span>
              <span className={`text-sm font-mono font-bold ${cls}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}