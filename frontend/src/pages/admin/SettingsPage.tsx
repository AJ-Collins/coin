import { useState } from "react";

// TODO: replace with GET /admin/settings, submit via PUT /admin/settings
const INITIAL_SETTINGS = {
  platformName: "AIscalpingPro",
  maintenanceMode: false,
  signupsEnabled: true,
  maxDailyLossPercent: 5,
  defaultLeverage: 10,
  withdrawalFeePercent: 0.5,
  supportEmail: "support@aiscalpingpro.com",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof settings>(key: K, value: typeof settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    // TODO: PUT /admin/settings with `settings`
    setSaved(true);
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-black text-white mb-1">Platform Settings</h1>
      <p className="text-sm text-gray-400 mb-6">Configuration for the platform.</p>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-5 space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Platform Name</label>
          <input
            value={settings.platformName}
            onChange={(e) => update("platformName", e.target.value)}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Support Email</label>
          <input
            value={settings.supportEmail}
            onChange={(e) => update("supportEmail", e.target.value)}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Max Daily Loss (%)</label>
            <input
              type="number"
              value={settings.maxDailyLossPercent}
              onChange={(e) => update("maxDailyLossPercent", Number(e.target.value))}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Default Leverage</label>
            <input
              type="number"
              value={settings.defaultLeverage}
              onChange={(e) => update("defaultLeverage", Number(e.target.value))}
              className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Withdrawal Fee (%)</label>
          <input
            type="number"
            step="0.1"
            value={settings.withdrawalFeePercent}
            onChange={(e) => update("withdrawalFeePercent", Number(e.target.value))}
            className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40"
          />
        </div>

        <div className="flex items-center justify-between border-t border-[#1a1f28] pt-4">
          <div>
            <div className="text-sm font-semibold text-white">New Signups</div>
            <div className="text-xs text-gray-500">Allow new users to register</div>
          </div>
          <Toggle checked={settings.signupsEnabled} onChange={(v) => update("signupsEnabled", v)} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Maintenance Mode</div>
            <div className="text-xs text-gray-500">Temporarily disable trading platform-wide</div>
          </div>
          <Toggle checked={settings.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={handleSave}
          className="bg-[#39ff88] text-[#05070a] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#5dffa1]"
        >
          Save Changes
        </button>
        {saved && <span className="text-xs text-[#39ff88]">Saved ✓</span>}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-[#39ff88]" : "bg-[#1a1f28]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}