import { useState } from "react";
import { Mail } from "lucide-react";
import { useAuth } from "../lib/auth";
import api from "../lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  
  // Track password inputs locally
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Custom toast notification feedback tracker
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  const showNotification = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 5000);
  };

  async function handleChangePassword() {
    if (!password.current || !password.next || !password.confirm) {
      showNotification("Please fill in all password fields.", true);
      return;
    }

    if (password.next !== password.confirm) {
      showNotification("New password confirmation entries do not match.", true);
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await api.post("/user/password", {
        currentPassword: password.current,
        newPassword: password.next,
        confirmPassword: password.confirm,
      });

      showNotification("Your account password has been updated successfully.");
      setPassword({ current: "", next: "", confirm: "" }); // Clean out form fields
    } catch (error) {
      console.error("Password modification error:", error);
      showNotification("Failed to modify password. Please verify current password entry.", true);
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6 mx-auto px-4 relative">
      
      {/* Universal Floating Status Toast Banner System */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-xl p-4 border animate-slideIn text-left shadow-2xl ${
          toast.isError 
            ? "bg-[#1c0d0d] border-[#441a1a] text-red-400" 
            : "bg-[#120d1e] border-[#2e1a52] text-[#a78bfa]"
        }`}>
          <h4 className="text-sm font-bold">{toast.isError ? "Action Rejected" : "Success"}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-white mb-1">Profile</h1>
        <p className="text-sm text-gray-400">Manage your account details and security settings.</p>
      </div>

      {/* Read-Only Profile Information Card */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">Profile Info</h2>
        
        <div className="flex items-center gap-4 bg-[#0a0d12] border border-[#1a1f28]/40 rounded-xl p-4 shadow-sm">
          {/* Decorative Icon Wrapper */}
          <div className="w-10 h-10 rounded-xl bg-[#1a1f28] flex items-center justify-center text-[#a78bfa] flex-shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          
          {/* Identity Text Content Stack */}
          <div className="text-left min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 tracking-widest">
              Registered Email
            </span>
            <span className="text-sm text-gray-200 font-medium font-mono truncate block select-all mt-0.5">
              {user?.email || "Loading secure profile data..."}
            </span>
          </div>
        </div>
      </div>

      {/* Security Credentials Modification Card Form */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">Change Password</h2>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Current Password</label>
          <input
            type="password"
            value={password.current}
            onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#a78bfa]/40 transition-colors"
            disabled={isUpdatingPassword}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">New Password</label>
            <input
              type="password"
              value={password.next}
              onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#a78bfa]/40 transition-colors"
              disabled={isUpdatingPassword}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Confirm Password</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#a78bfa]/40 transition-colors"
              disabled={isUpdatingPassword}
            />
          </div>
        </div>
        <button 
          onClick={handleChangePassword} 
          disabled={isUpdatingPassword}
          className="bg-[#1a1f28] text-white border border-gray-800/40 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#252b38] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isUpdatingPassword ? "Updating Password..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}