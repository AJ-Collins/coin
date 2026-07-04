import { useState, useEffect } from "react"
import { useAuth } from "../../lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../lib/api";

function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
      type === "success"
        ? "bg-violet-500/10 border border-violet-500/20 text-violet-400"
        : "bg-red-500/10 border border-red-500/20 text-red-400"
    }`}>
      {type === "success"
        ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
        : <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />}
      {message}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });

  const { data: profile } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data } = await api.get("/admin/profile");
      return data;
    },
  });

  useEffect(() => {
    if (profile?.email) setEmail(profile.email);
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: () => api.patch("/admin/profile", { email }),
    onSuccess: () => {
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => setProfileMsg(null), 3000);
    },
    onError: (e: any) => {
      setProfileMsg({ type: "error", text: e?.response?.data?.error || "Failed to update profile." });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: () => api.patch("/admin/profile/password", {
      currentPassword: password.current,
      newPassword: password.next,
      confirmPassword: password.confirm,
    }),
    onSuccess: () => {
      setPassword({ current: "", next: "", confirm: "" });
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setTimeout(() => setPasswordMsg(null), 3000);
    },
    onError: (e: any) => {
      setPasswordMsg({ type: "error", text: e?.response?.data?.error || "Failed to update password." });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    updateProfileMutation.mutate();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (password.next !== password.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (password.next.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    updatePasswordMutation.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6 mx-auto px-4">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Profile</h1>
        <p className="text-sm text-gray-400">Manage your admin account details.</p>
      </div>

      {/* Account Info */}
      <form onSubmit={handleSaveProfile} className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">Account Info</h2>

        {profileMsg && <Alert type={profileMsg.type} message={profileMsg.text} />}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Role</label>
          <div className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed">
            {profile?.role ?? user?.role ?? "ADMIN"}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#a78bfa]/40"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Member Since</label>
          <div className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
          </div>
        </div>

        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="bg-[#a78bfa] text-[#05070a] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#c4b5fd] flex items-center gap-2 disabled:opacity-50"
        >
          {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Profile
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">Change Password</h2>

        {passwordMsg && <Alert type={passwordMsg.type} message={passwordMsg.text} />}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Current Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password.current}
            onChange={(e) => setPassword(p => ({ ...p, current: e.target.value }))}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#a78bfa]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password.next}
              onChange={(e) => setPassword(p => ({ ...p, next: e.target.value }))}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#a78bfa]/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password.confirm}
              onChange={(e) => setPassword(p => ({ ...p, confirm: e.target.value }))}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#a78bfa]/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updatePasswordMutation.isPending}
          className="bg-[#1a1f28] text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#252b38] flex items-center gap-2 disabled:opacity-50"
        >
          {updatePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}