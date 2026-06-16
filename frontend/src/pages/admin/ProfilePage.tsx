import { useState } from "react";
import { useAuth } from "../../lib/auth";

// TODO: replace with GET /admin/profile
const INITIAL_PROFILE = {
  name: "Admin User",
  email: "admin@aiscalpingpro.com",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ ...INITIAL_PROFILE, email: user?.email ?? INITIAL_PROFILE.email });
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });

  function handleSaveProfile() {
    // TODO: PUT /admin/profile with `profile`
  }

  function handleChangePassword() {
    // TODO: POST /admin/profile/password with `password`
    setPassword({ current: "", next: "", confirm: "" });
  }

  return (
    <div className="max-w-2xl space-y-6 mx-auto px-4">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Profile</h1>
        <p className="text-sm text-gray-400">Manage your admin account details.</p>
      </div>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">Account Info</h2>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email</label>
          <input
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
          />
        </div>
        <button onClick={handleSaveProfile} className="bg-[#39ff88] text-[#05070a] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#5dffa1]">
          Save Profile
        </button>
      </div>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white">Change Password</h2>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Current Password</label>
          <input
            type="password"
            value={password.current}
            onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">New Password</label>
            <input
              type="password"
              value={password.next}
              onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Confirm Password</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
            />
          </div>
        </div>
        <button onClick={handleChangePassword} className="bg-[#1a1f28] text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#252b38]">
          Update Password
        </button>
      </div>
    </div>
  );
}