import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await forgotPassword(email.trim());
      setIsSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error ||"Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c14] text-[#f1f5f9] flex overflow-hidden font-sans">
      
      {/* ── LEFT COLUMN: Form Context ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-16 lg:px-20 py-12 relative z-10 bg-[#0c0c16]">
        
        {/* Glow orbs matching login profile */}
        <div className="absolute top-[15%] left-[-5%] w-[400px] h-[400px] bg-[#9b51e0] rounded-full blur-[140px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] bg-[#4fd1c5] rounded-full blur-[140px] opacity-7 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-14 cursor-pointer" onClick={() => navigate("/login")}>
            <img src="/logo.png" alt="AIscalpingPro" className="h-15 w-auto object-contain flex-shrink-0" />
          </div>

          {!isSent ? (
            <>
              {/* Heading */}
              <h1 className="text-[36px] font-black text-white tracking-tight leading-[1.1] mb-2.5">
                Recover account
              </h1>
              <p className="text-[15px] text-[#6b7280] leading-relaxed mb-12">
                Enter your registered email below to receive instructions to securely reset your password.
              </p>

              {/* Error Alert */}
              {error && (
                <div className="mb-7 p-[13px_16px] rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/20 text-[#f87171] text-[13px] flex items-center gap-2.5">
                  <svg className="w-[15px] h-[15px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-7">
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
                  ) : "Send Reset Instructions →"}
                </button>
              </form>
            </>
          ) : (
            /* Success confirmation card layout */
            <div className="text-left animate-fadeIn">
              <h1 className="text-[32px] font-black text-white tracking-tight leading-[1.1] mb-3">
                Check your inbox
              </h1>
              <p className="text-[15px] text-[#9ca3af] leading-relaxed mb-8">
                If an account exists for <span className="text-white font-semibold">{email}</span>, a link to securely update your password has been sent. It remains active for 1 hour.
              </p>
            </div>
          )}

          {/* Return Options link */}
          <p className="mt-8 text-[14px] text-[#6b7280] text-center">
            Remembered credentials?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="bg-transparent border-none text-[#e2e8f0] hover:text-[#4fd1c5] font-bold cursor-pointer text-[14px] p-0 transition-colors duration-200"
            >
              Back to Sign In
            </button>
          </p>

        </div>
      </div>

      {/* ── RIGHT COLUMN: Side banner styling preservation ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0c14]">
        <img src="/trading-candles.png" alt="Trading Chart" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c16] via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-start p-[6rem_3rem_4rem_5rem]">
          <h2 className="text-[5.5rem] font-black tracking-[-3px] leading-[1.0] mb-7 text-white">
            Secure /<br />Recover.
          </h2>
          <p className="text-[20px] text-[#9ca3af] max-w-[420px] leading-[1.75]">
            Multi-tier identity shielding protocols maintain account defense continuous parameters.
          </p>
        </div>
      </div>

    </div>
  );
}