const LINKS = {
  Product: ["Features", "Charts", "Pricing"],
  Support: ["Help Center", "Contact", "Status", "Docs"],
  Legal: ["Privacy", "Terms", "Cookies", "Disclosures"],
};

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#1a1f28] bg-[#0a0c14] px-4 py-16 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Link Grid & Identity */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 mb-16">
          
          {/* Brand Identity Column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-5 group w-fit">
              <img src="/logo.png" alt="AIscalpingPro Logo" className="h-10 w-40 group-hover:animate-pulse transition-transform" />
            </a>
            
            <p className="text-sm text-[#9ca3af] font-light leading-relaxed mb-6 max-w-xs">
              High-frequency, low-latency AI automated scalping protocols engineered for modern trading.
            </p>
            
            {/* Social Channels (Strict Vector Layouts) */}
            <div className="flex gap-2">
              {[
                {
                  id: "x",
                  icon: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )
                },
                {
                  id: "linkedin",
                  icon: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  )
                },
                {
                  id: "youtube",
                  icon: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.136z"/>
                    </svg>
                  )
                }
              ].map(({ id, icon }) => (
                <a
                  key={id}
                  href="#"
                  className="h-9 w-9 rounded-sm bg-[#070712] border border-[#1a1f28] flex items-center justify-center text-[#5f6470] hover:text-white hover:border-[#00f0ff]/40 transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Matrix Columns */}
          <div className="col-span-2 sm:col-span-3 md:col-span-4 grid grid-cols-3 gap-8">
            {Object.entries(LINKS).map(([group, items]) => (
              <div key={group}>
                <h4 className="font-mono font-bold text-xs text-white mb-5 tracking-widest uppercase">{group}</h4>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-xs text-[#9ca3af] hover:text-[#00f0ff] font-light transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}