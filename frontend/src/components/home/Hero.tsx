import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative z-10 overflow-hidden border-b border-[#1a1f28]">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat opacity-60" 
        aria-hidden="true"
      />

      {/* Enhancing overlay: combines a base darkening layer with a bottom-heavy gradient for text readability */}
      <div className="absolute inset-0 z-0 bg-[#070712]/50 bg-gradient-to-t from-[#070712] via-[#070712]/80 to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-28 md:pt-32 md:pb-40">
        {/* Live status readout */}
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#9ca3af] border border-[#1a1f28] rounded-sm px-4 py-2 mb-10 bg-[#0a0c14]/80 backdrop-blur-sm">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#39ff88] animate-pulse" />
            LIVE
          </span>
          <span className="text-[#1a1f28]">|</span>
          <span>SIGNAL ACCURACY <span className="text-[#39ff88] font-semibold">94.7%</span></span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-black leading-[0.95] mb-6 tracking-tight drop-shadow-lg">
          <span className="text-white">Read the market.</span>
          <br />
          <span className="text-[#39ff88]">Act in milliseconds.</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#9ca3af] max-w-lg md:max-w-2xl mb-10 leading-relaxed font-light drop-shadow-md">
          AIscalpingPro scans order flow continuously and fires scalp signals the
          moment edge appears — with automated execution and hard risk limits
          on every trade.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 w-full sm:w-auto px-4">
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-[#39ff88] text-[#05070a] font-black text-base px-8 py-4 rounded-sm hover:bg-[#5dffa1] transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(57,255,136,0.15)]">
              Start for free →
            </button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 border border-[#1a1f28] text-white font-semibold text-base px-8 py-4 rounded-sm hover:border-[#39ff88]/40 hover:bg-[#0a0c14]/80 backdrop-blur-sm transition-all duration-200 cursor-pointer">              
              Sign In
            </button>
          </Link>
        </div>

        {/* Data strip */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-y-5 gap-x-10 mt-14 pt-7 border-t border-[#1a1f28] w-full max-w-md md:max-w-none px-4">
          {[
            { val: "50K+", label: "ACTIVE TRADERS" },
            { val: "4.9 / 5", label: "APP RATING" },
            { val: "SOC 2", label: "CERTIFIED" },
            { val: "$2.8B+", label: "VOLUME TRADED" },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center md:items-start gap-1">
              <span className="font-mono text-lg font-bold text-white drop-shadow-md">{val}</span>
              <span className="font-mono text-[10px] tracking-wider text-[#5f6470]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}