const TICKERS = [
  { pair: "BTC/USD", price: "$67,842", change: "+2.34%", up: true },
  { pair: "ETH/USD", price: "$3,421", change: "+1.87%", up: true },
  { pair: "SOL/USD", price: "$142.30", change: "-0.52%", up: false },
  { pair: "BNB/USD", price: "$598.12", change: "+3.15%", up: true },
  { pair: "XRP/USD", price: "$0.6234", change: "+5.42%", up: true },
  { pair: "ADA/USD", price: "$0.4512", change: "-1.23%", up: false },
  { pair: "DOGE/USD", price: "$0.1289", change: "+8.76%", up: true },
  { pair: "AVAX/USD", price: "$35.67", change: "+1.05%", up: true },
  { pair: "DOT/USD", price: "$6.89", change: "-0.34%", up: false },
  { pair: "MATIC/USD", price: "$0.7845", change: "+2.91%", up: true },
  { pair: "LINK/USD", price: "$14.23", change: "+4.56%", up: true },
  { pair: "UNI/USD", price: "$7.45", change: "-2.11%", up: false },
];

interface TickerItemProps {
  pair: string;
  price: string;
  change: string;
  up: boolean;
}

const TickerItem = ({ pair, price, change, up }: TickerItemProps) => (
  <div className="flex items-center gap-2 px-5 py-0.5 border-r border-white/5 flex-shrink-0">
    <span className="text-[11px] font-semibold text-white/70">{pair}</span>
    <span className={`text-[11px] font-bold ${up ? "text-violet-400" : "text-rose-400"}`}>{price}</span>
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${up ? "bg-violet-500/15 text-violet-400" : "bg-rose-500/15 text-rose-400"}`}>
      {change}
    </span>
  </div>
);

export default function TickerRibbon() {
  return (
    <div className="relative z-30 bg-[#04040e]/90 border-b border-white/6 overflow-hidden py-2">
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: tickerScroll 50s linear infinite;
          display: flex;
          min-width: max-content;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-track">
        {[...TICKERS, ...TICKERS].map((t, i) => (
          <TickerItem key={i} {...t} />
        ))}
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#04040e]/90 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#04040e]/90 to-transparent pointer-events-none z-10" />
    </div>
  );
}