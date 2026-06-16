import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center max-w-md mx-auto px-4 text-center">
      {/* Huge Glitch-style 404 Header */}
      <h1 className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#1a1f28] leading-none mb-2 select-none">
        404
      </h1>
      
      <div className="space-y-1 mb-8">
        <h2 className="text-2xl font-black text-white">Lost in the Markets?</h2>
        <p className="text-sm text-gray-400">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      {/* System Error Trace Terminal Card */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 w-full space-y-5 text-left mb-6">
        <button 
          onClick={() => navigate("/welcome")} 
          className="w-full bg-[#39ff88] text-[#05070a] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#5dffa1] transition-colors text-center block"
        >
          Return to Dashboard
        </button>
      </div>

      <button 
        onClick={() => navigate(-1)} 
        className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
      >
        ← Go Back Home Page
      </button>
    </div>
  );
}