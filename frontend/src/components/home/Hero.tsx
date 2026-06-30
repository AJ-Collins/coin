import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative z-10 overflow-hidden border-b border-[#182035]">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0 bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat opacity-60"
        aria-hidden="true"
      />
      {/* Enhancing overlay */}
      <div className="absolute inset-0 z-0 bg-[#090f1a]/50 bg-gradient-to-t from-[#090f1a] via-[#090f1a]/80 to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-28 md:pt-32 md:pb-40">
        {/* Live status readout */}
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#8fa3b8] border border-[#182035] rounded-sm px-4 py-2 mb-10 bg-[#0e1624]/80 backdrop-blur-sm">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
            LIVE
          </span>
          <span className="text-[#182035]">|</span>
          <span>SIGNAL WIN RATE <span className="text-[#22d3ee] font-semibold">95.3%</span></span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-black leading-[0.95] mb-6 tracking-tight drop-shadow-lg">
          <span className="text-[#e8f1fa]">Smarter signals.</span>
          <br />
          <span className="text-[#22d3ee]">Sharper trades.</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#8fa3b8] max-w-lg md:max-w-2xl mb-10 leading-relaxed font-light drop-shadow-md">
          CoinfyChain delivers real-time crypto trading signals powered by
          on-chain data and market intelligence — so you always know when
          to enter, and when to walk away.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 w-full sm:w-auto px-4">
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-[#22d3ee] text-[#090f1a] font-black text-base px-8 py-4 rounded-sm hover:bg-[#67e8f9] transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              Start for free →
            </button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 border border-[#182035] text-[#e8f1fa] font-semibold text-base px-8 py-4 rounded-sm hover:border-[#22d3ee]/40 hover:bg-[#0e1624]/80 backdrop-blur-sm transition-all duration-200 cursor-pointer">
              Sign In
            </button>
          </Link>
        </div>

        {/* Data strip */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-y-5 gap-x-10 mt-14 pt-7 border-t border-[#182035] w-full max-w-md md:max-w-none px-4">
          {[
            { val: "120K+", label: "ACTIVE TRADERS" },
            { val: "4.8 / 5", label: "APP RATING" },
            { val: "200+", label: "COINS COVERED" },
            { val: "$5.4B+", label: "VOLUME TRADED" },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center md:items-start gap-1">
              <span className="font-mono text-lg font-bold text-[#e8f1fa] drop-shadow-md">{val}</span>
              <span className="font-mono text-[10px] tracking-wider text-[#8fa3b8]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}