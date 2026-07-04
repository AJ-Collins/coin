const PAIRS = [
  {
    pair: "BTC/USDT",
    price: "$67,842.10",
    vol: "$2.4B",
    change: "+2.34%",
    signal: "BUY",
    up: true,
    icon: (
      <svg className="h-4 w-4 text-[#f7931a]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.4 7.65c-.23-1.52-1.74-1.95-3.52-2.33v-1.9h-1.8v1.85c-.46-.11-.94-.22-1.42-.32v-1.85h-1.8v1.9c-.4.09-.8.19-1.18.28l-.34-1.37s-1.48.36-1.45.35c-.81.2-1.05.71-1.05.71l.6 2.4s.2-.05.32-.08c.5-.12.82.04.97.58l1.45 5.84c.05.15-.03.35-.18.49-.13.12-.35.15-.35.15l-1 2.37s1.39-.33 1.45-.35c.46-.11.91-.22 1.37-.32v1.89h1.8v-1.93c.5.11 1 .22 1.48.33v1.92h1.8v-1.9c2.31.42 4.05.25 4.56-1.84.41-1.68-.2-2.6-1.28-3.21.91-.21 1.6-.82 1.76-2.1zM11 15.55c-1.55-.38-2.5-.1-2.5-.1l.8-3.2s.93.1 2.48.49c1.07.27 1.42 1.14 1.25 1.83-.16.71-.85 1.25-2.03.98zm.75-4.52c-1.4-.35-2.18-.08-2.18-.08l.73-2.92s.78.07 2.18.42c.98.24 1.34.92 1.21 1.51-.14.61-.75 1.31-1.94 1.07z"/>
      </svg>
    )
  },
  {
    pair: "ETH/USDT",
    price: "$3,421.80",
    vol: "$1.1B",
    change: "+1.87%",
    signal: "BUY",
    up: true,
    icon: (
      <svg className="h-4 w-4 text-[#627eea]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 17.854L4.5 13.445l7.444 4.41 7.444-4.41zM12 2v11.411l7.444-4.406zm0 19.962l7.444-10.45L12 14.931l-7.444-3.414zM12 2L4.556 9.005 12 13.411z"/>
      </svg>
    )
  },
  {
    pair: "SOL/USDT",
    price: "$142.30",
    vol: "$890M",
    change: "-0.52%",
    signal: "SELL",
    up: false,
    icon: (
      <svg className="h-3.5 w-3.5 text-[#14f195]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.402 18.262h15.93a.412.412 0 01.293.704l-3.084 3.084a.825.825 0 01-.585.242H1.026a.412.412 0 01-.293-.704l3.084-3.084a.825.825 0 01.585-.242zm15.196-6.6H3.668a.412.412 0 00-.293.704l3.084 3.084a.825.825 0 00.585.242h15.93a.412.412 0 00.293-.704l-3.084-3.084a.825.825 0 00-.585-.242zM4.402 1.708h15.93a.412.412 0 01.293.704l-3.084 3.084a.825.825 0 01-.585.242H1.026a.412.412 0 01-.293-.704l3.084-3.084a.825.825 0 01.585-.242z"/>
      </svg>
    )
  },
  {
    pair: "XRP/USDT",
    price: "$0.6234",
    vol: "$450M",
    change: "+5.42%",
    signal: "BUY",
    up: true,
    icon: (
      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" d="M5 4l14 16M19 4L5 16" />
      </svg>
    )
  },
  {
    pair: "DOGE/USDT",
    price: "$0.1289",
    vol: "$320M",
    change: "+8.76%",
    signal: "BUY",
    up: true,
    icon: (
      <svg className="h-4 w-4 text-[#c2a633]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.65 14.59h-2.91v-1.68h-.79v-1.42h.79V11.5h-.79V10.1h.79V8.34h2.79c1.64 0 2.61.94 2.61 2.37 0 1.05-.57 1.83-1.5 2.15.99.28 1.66 1.15 1.66 2.36 0 1.4-.95 2.37-2.44 2.37zm-.12-6.85h-1.14v1.54h1.14c.64 0 1.01-.32 1.01-.78s-.37-.76-1.01-.76zm.18 3.86h-1.32v1.7h1.32c.67 0 1.08-.34 1.08-.85 0-.53-.41-.85-1.08-.85z"/>
      </svg>
    )
  }
];

export default function MarketData() {
  return (
    <section id="market-feed" className="relative z-10 px-4 py-20 md:py-28 max-w-7xl mx-auto border-b border-[#1a1f28]">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#9ca3af] border border-[#1a1f28] rounded-sm px-4 py-2 mb-8 bg-[#0a0c14]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
            LIVE MARKET FEED
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          <span className="text-white">Prices, volume & signals —</span><br />
          <span className="text-[#a78bfa] drop-shadow-md">streaming live in real-time.</span>
        </h2>
      </div>

      {/* Terminal Grid Table */}
      <div className="bg-[#0a0c14] border border-[#1a1f28] rounded-sm overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        
        {/* Table Header Row */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 px-6 py-4 border-b border-[#1a1f28] bg-[#070712]">
          {["Pair", "Price", "24h Vol", "Change", "AI Signal", "Action"].map((h, i) => (
            <span
              key={i}
              className={`text-[10px] font-mono font-bold text-[#5f6470] uppercase tracking-widest ${
                i === 0 ? "text-left" : "text-right"
              } ${i === 2 || i === 4 || i === 5 ? "hidden md:block" : ""}`}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-[#1a1f28]">
          {PAIRS.map(({ pair, icon, price, vol, change, signal, up }) => (
            <div
              key={pair}
              className="grid grid-cols-4 md:grid-cols-6 gap-4 px-6 py-4 text-xs items-center hover:bg-[#1a1f28]/30 transition-colors group"
            >
              {/* Asset Pair Info */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-sm bg-[#1a1f28] border border-[#1a1f28]/60 flex items-center justify-center group-hover:border-[#9ca3af]/20 transition-colors">
                  {icon}
                </div>
                <span className="font-bold text-white text-sm tracking-wide">{pair}</span>
              </div>
              
              {/* Market Metrics (Enforced Monospace) */}
              <span className="text-right font-mono font-bold text-white text-sm">{price}</span>
              
              <span className="text-right font-mono text-[#9ca3af] hidden md:block">{vol}</span>
              
              <span className={`text-right font-mono font-bold text-sm ${up ? "text-[#a78bfa]" : "text-[#ff4d6d]"}`}>
                {change}
              </span>
              
              {/* AI Badge Readout */}
              <div className="text-right hidden md:block">
                <span className={`inline-flex text-[10px] font-mono font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                  up 
                    ? "bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/20" 
                    : "bg-[#ff4d6d]/10 text-[#ff4d6d] border border-[#ff4d6d]/20"
                }`}>
                  {signal}
                </span>
              </div>
              
              {/* Row Action CTA */}
              <div className="text-right hidden md:block">
                <button className="text-[10px] font-mono font-bold uppercase tracking-widest bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 px-4 py-2 rounded-sm hover:bg-[#00f0ff]/20 transition-colors cursor-pointer">
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}