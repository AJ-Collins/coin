import { Link } from "react-router-dom";

export default function CTABanner() {
  return (
    <section id="cta-terminal" className="relative z-10 px-4 py-20 md:py-28 max-w-7xl mx-auto">
      <div className="relative overflow-hidden bg-[#0a0c14] border border-[#1a1f28] rounded-sm p-8 md:p-16 text-center shadow-[0_0_50px_rgba(0,0,0,0.7)]">
        
        {/* Terminal matrix background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f28_1px,transparent_1px),linear-gradient(to_bottom,#1a1f28_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-20 pointer-events-none" />
        
        {/* Subtle geometric structural border lights */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00f0ff]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00f0ff]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00f0ff]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00f0ff]" />

        <div className="relative">
          {/* Active Network Pulse Badge */}
          <div className="inline-flex items-center gap-2 bg-[#070712] border border-[#1a1f28] rounded-sm px-4 py-2 text-[10px] font-mono font-bold tracking-widest text-[#9ca3af] mb-8 uppercase">
            <span className="h-1.5 w-1.5 rounded-sm bg-[#39ff88] animate-pulse shadow-[0_0_5px_#39ff88]" />
            DEPLOYS_ACTIVE: 50,000+ COMPILATIONS
          </div>

          {/* Header Typography */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
            <span className="text-white">Ready to initiate</span><br />
            <span className="text-[#00f0ff] drop-shadow-md">deployment?</span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Initialize execution free. No banking collateral required. Connect your production exchange API in 90 seconds and deploy your first high-frequency strategy.
          </p>

          {/* CTA Button Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <Link to="/register" className="w-full sm:w-auto flex-1">
              <button className="w-full bg-[#22d3ee] text-[#090f1a] font-mono font-black text-xs uppercase tracking-widest px-8 py-4 rounded-sm hover:bg-[#67e8f9] transition-colors shadow-[0_0_20px_rgba(57,255,136,0.2)] flex items-center justify-center gap-2 cursor-pointer">
                Get started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </Link>
            
            <a href="/login" className="w-full sm:w-auto flex-1">
              <button className="w-full flex items-center justify-center gap-2 bg-[#070712] text-white font-mono font-bold text-xs uppercase tracking-widest border border-[#1a1f28] rounded-sm px-8 py-4 hover:border-[#00f0ff]/40 hover:text-[#00f0ff] transition-all cursor-pointer">
                Sign In
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}