const STATS = [
  { 
    val: "$2.8B+", 
    label: "Trading Volume", 
    color: "text-[#00f0ff]",
    icon: (
      <svg className="w-5 h-5 text-[#00f0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    )
  },
  { 
    val: "50K+",   
    label: "Active Scalpers", 
    color: "text-white",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
      </svg>
    )
  },
  { 
    val: "94.7%",  
    label: "Signal Accuracy", 
    color: "text-[#39ff88]",
    icon: (
      <svg className="w-5 h-5 text-[#39ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    val: "0.3s",   
    label: "Execution Speed", 
    color: "text-[#fbbf24]",
    icon: (
      <svg className="w-5 h-5 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
];

export default function Stats() {
  return (
    <section id="telemetry-stats" className="relative z-10 px-4 py-12 max-w-7xl mx-auto border-b border-[#1a1f28]">
      <div className="relative bg-[#0a0c14] border border-[#1a1f28] rounded-sm p-8 md:p-10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        
        {/* Terminal subtle background matrix grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f28_1px,transparent_1px),linear-gradient(to_bottom,#1a1f28_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-15 pointer-events-none" />

        {/* Outer subtle glow matching system style */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent" />

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y divide-[#1a1f28]/40 md:divide-y-0 md:divide-x md:divide-[#1a1f28]/60">
          {STATS.map(({ val, label, color, icon }, i) => (
            <div 
              key={label} 
              className={`group flex flex-col items-center md:items-start text-center md:text-left ${
                i >= 2 ? 'pt-6 md:pt-0' : 'pt-0'
              } ${i % 2 === 1 ? 'pt-0 sm:pt-0' : ''} md:px-6`}
            >
              {/* Telemetry Icon / Frame Label */}
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-[#070712] border border-[#1a1f28] rounded-sm">
                  {icon}
                </div>
                <span className="text-[9px] font-mono font-bold text-[#5f6470] tracking-widest uppercase">
                  SYS_MTRCH_{String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Data Value Core Output */}
              <div className={`text-3xl sm:text-4xl md:text-5xl font-mono font-black mb-2 tabular-nums tracking-tighter transition-transform duration-300 group-hover:translate-x-1 ${color}`}>
                {val}
              </div>

              {/* Description Label */}
              <div className="text-[10px] font-mono text-[#5f6470] uppercase tracking-widest font-bold">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}