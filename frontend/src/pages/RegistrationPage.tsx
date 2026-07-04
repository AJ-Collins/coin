import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function RegistrationPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password);
      navigate("/welcome");
    } catch {
      setError("Could not create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      {isVisible ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.478 0-8.268-2.943-9.543-7z" />
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#0a0c14] text-[#f1f5f9] flex overflow-hidden font-sans">
      
      {/* ── LEFT COLUMN: Registration Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-16 lg:px-20 py-12 relative z-10 bg-[#0c0c16]">
        
        {/* Glow orbs */}
        <div className="absolute top-[15%] left-[-5%] w-[400px] h-[400px] bg-[#9b51e0] rounded-full blur-[140px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] bg-[#4fd1c5] rounded-full blur-[140px] opacity-7 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-14">
            <img 
              src="/logo.png" 
              alt="CoinfyChain" 
              className="h-15 w-auto object-contain flex-shrink-0" 
            />
          </div>

          {/* Heading */}
          <h1 className="text-[36px] font-black text-white tracking-tight leading-[1.1] mb-2.5">
            Create your account
          </h1>
          <p className="text-[15px] text-[#6b7280] leading-relaxed mb-12">
            Join 50,000+ scalpers using AI-powered signals.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-7 p-[13px_16px] rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/20 text-[#f87171] text-[13px] flex items-center gap-2.5">
              <svg className="w-[15px] h-[15px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-2.5">
                Email address
              </label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                type="email"
                required
                className="w-full bg-[#0a0c14] border border-[#1e2230] rounded-lg py-3 px-4 text-[16px] text-[#f1f5f9] outline-none transition-all duration-200 focus:border-[#4fd1c5] placeholder-[#374151]"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-2.5">Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type={showPassword ? "text" : "password"} required className="w-full bg-[#0a0c14] border border-[#1e2230] rounded-lg py-3 px-4 pr-12 text-[16px] text-[#f1f5f9] outline-none focus:border-[#9b51e0] tracking-[2px]" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-[#4b5563] hover:text-[#f1f5f9]">
                <EyeIcon isVisible={showPassword} />
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-2.5">Confirm Password</label>
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" type={showPassword ? "text" : "password"} required className="w-full bg-[#0a0c14] border border-[#1e2230] rounded-lg py-3 px-4 pr-12 text-[16px] text-[#f1f5f9] outline-none focus:border-[#f6ad55] tracking-[2px]" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-[#4b5563] hover:text-[#f1f5f9]">
                <EyeIcon isVisible={showPassword} />
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-[#0c0c16] rounded-lg p-[15px_24px] text-[15px] font-extrabold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_12px_rgba(255,255,255,0.05)] hover:bg-[#f0f0f0] hover:shadow-[0_8px_24px_rgba(255,255,255,0.1)] tracking-[0.01em] cursor-pointer"
            >
              {isLoading ? (
                <svg className="animate-spin w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : "Create Account →"}
            </button>
          </form>

          {/* Link to login */}
          <p className="mt-8 text-[14px] text-[#6b7280] text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="bg-transparent border-none text-[#e2e8f0] hover:text-[#4fd1c5] font-bold cursor-pointer text-[14px] p-0 transition-colors duration-200"
            >
              Sign in
            </button>
          </p>

          {/* Footer note */}
          <p className="mt-12 text-[11px] text-[#374151] flex items-center justify-center gap-1.5 border-t border-[#1e2230] pt-6">
            <svg className="w-3 h-3 text-[#374151]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            AES-256 encrypted · SOC 2 certified
          </p>

        </div>
      </div>

      {/* ── RIGHT COLUMN: Image Banner ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0c14]">
        <img 
          src="/trading-banner.png" 
          alt="Trading Chart" 
          className="w-full h-full object-cover opacity-50" 
        />
        {/* Layer Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c16] via-transparent to-transparent" />
        
        {/* Content Frame */}
        <div className="absolute inset-0 flex flex-col justify-start p-[6rem_3rem_4rem_5rem]">
          <div className="inline-flex items-center gap-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full px-4 py-1.5 text-[12px] text-[#d1d5db] mb-8 w-max backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#48bb78] inline-block animate-pulse" />
            AI Scalping System Online
          </div>
          
          <h2 className="text-[5.5rem] font-black tracking-[-3px] leading-[1.0] mb-7 text-white">
            Look first /<br />Then leap.
          </h2>
          
          <p className="text-[20px] text-[#9ca3af] max-w-[420px] leading-[1.75]">
            Analyze millions of data points in real-time. Execute scalp trades with 94.7% signal accuracy.
          </p>
          
          {/* Metrics Layout */}
          <div className="flex gap-8 mt-12">
            {[
              ["94.7%", "#4fd1c5", "Signal Accuracy"], 
              ["0.3s", "#9b51e0", "Execution"], 
              ["50K+", "#f6ad55", "Traders"]
            ].map(([val, color, label], i, arr) => (
              <div key={val} className="flex gap-8 items-center">
                <div>
                  <div className="text-[46px] font-black" style={{ color }}>{val}</div>
                  <div className="text-[14px] text-[#6b7280] mt-1.5">{label}</div>
                </div>
                {i < arr.length - 1 && <div className="w-px h-12 bg-[#1e2230]" />}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}