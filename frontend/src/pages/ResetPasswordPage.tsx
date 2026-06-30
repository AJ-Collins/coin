import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      {isVisible ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.478 0-8.268-2.943-9.543-7z" />
      )}
    </svg>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing identifier token. Please use a valid reset link.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setIsLoading(true);

    try {
      // 3. Use the pipeline to direct to port 5000 natively
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      const serverMessage = err.response?.data?.error;
      if (serverMessage === "INVALID_OR_EXPIRED_TOKEN") {
        setError("This reset link is invalid or has expired. Please request a new link.");
      } else {
        setError(serverMessage || "An internal error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c14] text-[#f1f5f9] flex overflow-hidden font-sans">
      
      {/* ── LEFT COLUMN: Form Elements ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-16 lg:px-20 py-12 relative z-10 bg-[#0c0c16]">
        
        {/* Ambient background accent fields */}
        <div className="absolute top-[15%] left-[-5%] w-[400px] h-[400px] bg-[#090f1a] rounded-full blur-[140px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] bg-[#22d3ee] rounded-full blur-[140px] opacity-7 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          
          {/* Logo Frame */}
          <div className="flex items-center gap-2.5 mb-14">
            <img src="/logo.png" alt="AIscalpingPro" className="h-15 w-auto object-contain flex-shrink-0" />
          </div>

          {!success ? (
            <>
              {/* Headings */}
              <h1 className="text-[36px] font-black text-white tracking-tight leading-[1.1] mb-2.5">
                Set new password
              </h1>
              <p className="text-[15px] text-[#6b7280] leading-relaxed mb-12">
                Choose a strong, unique password to complete your account access sequence.
              </p>

              {/* Status/Error Alerts */}
              {error && (
                <div className="mb-7 p-[13px_16px] rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/20 text-[#f87171] text-[13px] flex items-center gap-2.5">
                  <svg className="w-[15px] h-[15px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">
                
                {/* New Password */}
                <div className="relative">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-2.5">
                    New Password
                  </label>
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-[#0a0c14] border border-[#1e2230] rounded-lg py-3 px-4 text-[16px] text-[#f1f5f9] outline-none transition-all duration-200 focus:border-[#9b51e0] placeholder-[#374151] tracking-[2px]"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-[#4b5563] hover:text-[#f1f5f9]">
                    <EyeIcon isVisible={showPassword} />
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-2.5">
                    Confirm New Password
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-[#0a0c14] border border-[#1e2230] rounded-lg py-3 px-4 text-[16px] text-[#f1f5f9] outline-none transition-all duration-200 focus:border-[#9b51e0] placeholder-[#374151] tracking-[2px]"
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
                  ) : "Update Password →"}
                </button>
              </form>
            </>
          ) : (
            /* Successful execution view */
            <div className="text-left animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#4fd1c5]/10 border border-[#4fd1c5]/20 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#4fd1c5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-[32px] font-black text-white tracking-tight leading-[1.1] mb-3">
                Password changed
              </h1>
              <p className="text-[15px] text-[#9ca3af] leading-relaxed mb-10">
                Your credentials have been securely set. You may now log in.
              </p>
              
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-white text-[#0c0c16] rounded-lg p-[15px_24px] text-[15px] font-extrabold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#f0f0f0]"
              >
                Proceed to Login →
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── RIGHT COLUMN: Side banner styling preservation ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0c14]">
        <img src="/trading-candles.png" alt="Trading Chart" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c16] via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-start p-[6rem_3rem_4rem_5rem]">
          <h2 className="text-[5.5rem] font-black tracking-[-3px] leading-[1.0] mb-7 text-white">
            Confirm /<br />Proceed.
          </h2>
          <p className="text-[20px] text-[#9ca3af] max-w-[420px] leading-[1.75]">
            Secure key authorization routines protect account changes natively against hijacking mechanics.
          </p>
        </div>
      </div>

    </div>
  );
}