function PhoneSignals() {
  return (
    <div className="relative w-64 h-[520px] bg-[#0a0c14] rounded-[2rem] border-4 border-[#1a1f28] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex-shrink-0">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1f28] rounded-b-xl z-10" />

      {/* Status bar */}
      <div className="pt-6 px-5 flex justify-between items-center text-[10px] font-mono text-[#5f6470]">
        <span>09:41</span>
        <div className="flex gap-1.5 items-center">
          <span>5G</span>
          {/* Battery Icon */}
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-4h-2V8c0-1.1-.9-2-2-2zm0 10H3V8h14v8z"/>
            <rect x="5" y="10" width="10" height="4" />
          </svg>
        </div>
      </div>

      <div className="px-4 py-3 h-full">
        {/* App header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-black text-white tracking-tight">
            Coinfy<span className="text-[#00f0ff]">Chain</span>
          </span>
          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#a78bfa]">
            <span className="h-1.5 w-1.5 rounded-sm bg-[#a78bfa] animate-pulse shadow-[0_0_5px_#a78bfa]" />
            Live
          </div>
        </div>

        {/* Mini chart */}
        <div className="bg-[#070712] border border-[#1a1f28] rounded-sm p-3 mb-4 h-28 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 220 90" preserveAspectRatio="none">
            <defs>
              <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines inside SVG */}
            <line x1="0" y1="30" x2="220" y2="30" stroke="#1a1f28" strokeWidth="1" />
            <line x1="0" y1="60" x2="220" y2="60" stroke="#1a1f28" strokeWidth="1" />
            
            <polygon fill="url(#miniGrad)" points="0,65 25,58 55,70 80,45 105,38 130,50 155,22 175,28 200,10 220,14 220,90 0,90" />
            <polyline fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="square"
              points="0,65 25,58 55,70 80,45 105,38 130,50 155,22 175,28 200,10 220,14" />
          </svg>
          <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] px-1.5 py-0.5 rounded-sm">
            +2.34%
          </span>
          <span className="absolute bottom-2 left-2 text-[9px] font-mono text-[#5f6470] tracking-wider uppercase">BTC/USDT · 15m</span>
        </div>

        {/* Buy signal */}
        <div className="bg-[#070712] rounded-sm p-3 mb-3 border border-[#a78bfa]/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#a78bfa]" />
          <div className="flex justify-between items-center mb-1.5 pl-2">
            <span className="text-[10px] font-mono font-bold text-[#a78bfa] tracking-widest uppercase">BUY SIGNAL</span>
            <span className="text-[9px] font-mono text-[#5f6470]">2s ago</span>
          </div>
          <div className="flex justify-between items-center mb-3 pl-2">
            <span className="text-sm font-bold text-white tracking-wide">BTC/USDT</span>
            <span className="text-[11px] font-mono text-[#a78bfa] font-bold">+1.8% target</span>
          </div>
          <button className="w-full bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 text-[#a78bfa] text-[10px] font-mono font-bold tracking-widest py-2 rounded-sm transition-colors border border-[#a78bfa]/20 flex items-center justify-center gap-2">
            EXECUTE SCALP 
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>

        {/* Sell signal */}
        <div className="bg-[#070712] rounded-sm p-3 border border-[#ff4d6d]/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4d6d]" />
          <div className="flex justify-between items-center mb-1.5 pl-2">
            <span className="text-[10px] font-mono font-bold text-[#ff4d6d] tracking-widest uppercase">SELL SIGNAL</span>
            <span className="text-[9px] font-mono text-[#5f6470]">18s ago</span>
          </div>
          <div className="flex justify-between items-center mb-3 pl-2">
            <span className="text-sm font-bold text-white tracking-wide">ETH/USDT</span>
            <span className="text-[11px] font-mono text-[#ff4d6d] font-bold">-0.9% stop</span>
          </div>
          <button className="w-full bg-[#ff4d6d]/10 hover:bg-[#ff4d6d]/20 text-[#ff4d6d] text-[10px] font-mono font-bold tracking-widest py-2 rounded-sm transition-colors border border-[#ff4d6d]/20 flex items-center justify-center gap-2">
            EXECUTE SCALP
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#070712] border-t border-[#1a1f28] flex justify-around py-4 pb-6">
        {/* Chart Icon */}
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 3v18h18 M7 15l4-4 4 4 6-6"/></svg>
        {/* Bell Icon */}
        <svg className="w-5 h-5 text-[#5f6470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        {/* Wallet Icon */}
        <svg className="w-5 h-5 text-[#5f6470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        {/* Settings Icon */}
        <svg className="w-5 h-5 text-[#5f6470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      </div>
    </div>
  );
}

function PhoneTrades() {
  const trades = [
    { pair: "SOL/USDT", entry: "$140.20", pnl: "+$42.30", pct: "+0.30%", up: true },
    { pair: "DOGE/USDT", entry: "$0.1250", pnl: "+$18.75", pct: "+0.15%", up: true },
    { pair: "ADA/USDT", entry: "$0.4520", pnl: "-$5.12", pct: "-0.11%", up: false },
  ];

  return (
    <div className="relative w-64 h-[520px] bg-[#0a0c14] rounded-[2rem] border-4 border-[#1a1f28] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex-shrink-0">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1f28] rounded-b-xl z-10" />
      <div className="pt-6 px-5 flex justify-between items-center text-[10px] font-mono text-[#5f6470]">
        <span>09:41</span>
        <div className="flex gap-1.5 items-center">
          <span>5G</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-4h-2V8c0-1.1-.9-2-2-2zm0 10H3V8h14v8z"/>
            <rect x="5" y="10" width="10" height="4" />
          </svg>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-4 mt-2">
          <span className="text-sm font-black text-white tracking-tight">Active Scalps</span>
          <span className="text-[9px] font-mono text-[#00f0ff] font-bold bg-[#00f0ff]/10 border border-[#00f0ff]/20 px-2 py-0.5 rounded-sm uppercase tracking-widest">
            {trades.length} Open
          </span>
        </div>

        <div className="space-y-2 mb-5">
          {trades.map(({ pair, entry, pnl, pct, up }) => (
            <div key={pair} className={`bg-[#070712] rounded-sm p-3 border-l-2 ${up ? "border-[#a78bfa] bg-[#a78bfa]/5" : "border-[#ff4d6d] bg-[#ff4d6d]/5"}`}>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-white tracking-wide">{pair}</span>
                <span className={`text-[13px] font-mono font-bold ${up ? "text-[#a78bfa]" : "text-[#ff4d6d]"}`}>{pnl}</span>
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] font-mono text-[#5f6470]">
                <span>ENTRY: {entry}</span>
                <span className={up ? "text-[#a78bfa]" : "text-[#ff4d6d]"}>{pct}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Daily perf block (Terminal Style) */}
        <div className="bg-[#070712] rounded-sm p-4 border border-[#1a1f28]">
          <span className="text-[9px] font-mono text-[#5f6470] uppercase tracking-widest block mb-3">Today's PNL</span>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-mono font-black text-[#a78bfa] tracking-tight">+$876.42</span>
            <div className="text-right">
              <span className="block text-[9px] font-mono text-[#5f6470] uppercase tracking-wider mb-0.5">12 trades</span>
              <span className="text-[9px] font-mono text-[#a78bfa] bg-[#a78bfa]/10 px-1 py-0.5 rounded-sm">83% WIN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[#070712] border-t border-[#1a1f28] flex justify-around py-4 pb-6">
        <svg className="w-5 h-5 text-[#5f6470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 3v18h18 M7 15l4-4 4 4 6-6"/></svg>
        <svg className="w-5 h-5 text-[#5f6470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        <svg className="w-5 h-5 text-[#5f6470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      </div>
    </div>
  );
}

export default function MobileApp() {
  return (
    <section id="mobile-app" className="relative z-10 px-4 py-20 md:py-28 max-w-7xl mx-auto border-b border-[#1a1f28]">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#9ca3af] border border-[#1a1f28] rounded-sm px-4 py-2 mb-8 bg-[#0a0c14]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
            MOBILE APP
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          <span className="text-white">Full scalping power</span><br />
          <span className="text-[#a78bfa] drop-shadow-md">in your pocket.</span>
        </h2>
        
        <p className="text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto font-light leading-relaxed">
          Real-time alerts, one-tap execution, and live charts. The complete desktop experience, optimized for wherever you are.
        </p>
      </div>

      {/* Phones Grid */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-20 mb-16 relative">
        {/* Glow effect behind phones */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#a78bfa]/5 blur-[100px] rounded-full z-0 pointer-events-none" />
        
        <div className="text-center relative z-10">
          <PhoneSignals />
          <p className="mt-4 text-[10px] font-mono text-[#5f6470] tracking-widest uppercase">iOS Dashboard</p>
        </div>
        <div className="text-center hidden sm:block relative z-10">
          <PhoneTrades />
          <p className="mt-4 text-[10px] font-mono text-[#5f6470] tracking-widest uppercase">Android Dashboard</p>
        </div>
      </div>
    </section>
  );
}