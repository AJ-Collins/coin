const REVIEWS = [
  {
    quote: "The AI scalp signals caught a BTC breakout before anyone else saw it. 18% in 3 days. The mobile app is surgical.",
    name: "James D.",
    role: "Crypto Scalper",
    avatar: "JD",
    uid: "USR-8942",
    accent: "text-[#a78bfa] border-[#a78bfa]/20 bg-[#a78bfa]/5",
  },
  {
    quote: "I ran the backtesting engine on my manual strategy. The AI version outperformed it by 34%. Now I run four strategies daily.",
    name: "Sarah M.",
    role: "Forex Scalper",
    avatar: "SM",
    uid: "USR-0214",
    accent: "text-[#00f0ff] border-[#00f0ff]/20 bg-[#00f0ff]/5",
  },
  {
    quote: "During the flash crash, Risk Shield kicked in at exactly the right moment. Saved me from a $12K loss. This tool pays for itself.",
    name: "Ravi K.",
    role: "Day Trader",
    avatar: "RK",
    uid: "USR-7751",
    accent: "text-[#fbbf24] border-[#fbbf24]/20 bg-[#fbbf24]/5",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative z-10 px-4 py-20 md:py-28 max-w-7xl mx-auto border-b border-[#1a1f28]">
      
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-3 font-mono text-xs text-[#9ca3af] border border-[#1a1f28] rounded-sm px-4 py-2 mb-8 bg-[#0a0c14]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff]" />
            SYSTEM LOGS // USER TELEMETRY
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          <span className="text-white">Loved by</span><br />
          <span className="text-[#00f0ff] drop-shadow-md">50,000 active scalpers.</span>
        </h2>
        
        <p className="text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto font-light leading-relaxed">
          Verifiable execution metrics and real feedback from high-frequency terminal operators.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map(({ quote, name, role, avatar, uid, accent }) => (
          <div
            key={name}
            className="relative bg-[#0a0c14] border border-[#1a1f28] rounded-sm p-6 md:p-8 hover:border-[#00f0ff]/40 transition-all duration-300 flex flex-col group shadow-[0_0_30px_rgba(0,0,0,0.4)]"
          >
            {/* Top Terminal Ribbon */}
            <div className="flex items-center justify-between mb-6">
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded-sm tracking-widest ${accent}`}>
                {uid}
              </span>
              
              {/* Star Indicators Replaced by Surgical Terminal Checkmarks */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3 w-3 text-[#a78bfa]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial Quote */}
            <p className="text-[#9ca3af] text-sm font-light leading-relaxed mb-8 flex-1 italic relative pl-4 border-l border-[#1a1f28]">
              "{quote}"
            </p>

            {/* User Meta Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1a1f28]/60">
              <div className="flex items-center gap-3">
                {/* Rigid Sharp Identity Badge */}
                <div className="h-9 w-9 rounded-sm bg-[#070712] border border-[#1a1f28] flex items-center justify-center text-[#00f0ff] font-mono font-bold text-xs flex-shrink-0 group-hover:border-[#00f0ff]/30 transition-colors">
                  {avatar}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block tracking-wide">{name}</span>
                  <span className="text-[10px] font-mono text-[#5f6470] uppercase tracking-wider">{role}</span>
                </div>
              </div>

              {/* Status Marker */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#a78bfa] bg-[#a78bfa]/5 border border-[#a78bfa]/10 px-1.5 py-0.5 rounded-sm uppercase tracking-widest">
                <span className="h-1 w-1 rounded-sm bg-[#a78bfa]" />
                Verified
              </div>
            </div>
            
          </div>
        ))}
      </div>

    </section>
  );
}