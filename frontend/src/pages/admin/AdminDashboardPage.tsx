import { Users, Megaphone, ArrowLeftRight, Wallet, TrendingUp, AlertTriangle } from "lucide-react";

// TODO: replace with GET /admin/stats
const STATS = [
  { label: "Total Users", value: "12,438", icon: Users, color: "text-[#7f9cf5]", delta: "+128 today" },
  { label: "Active Marketers", value: "34", icon: Megaphone, color: "text-[#f6ad55]", delta: "+2 this week" },
  { label: "Trades Today", value: "8,902", icon: ArrowLeftRight, color: "text-[#39ff88]", delta: "+14.2%" },
  { label: "Pending Deposits", value: "$184,200", icon: Wallet, color: "text-[#4fd1c5]", delta: "27 pending" },
];

// TODO: replace with GET /admin/activity
const RECENT_ACTIVITY = [
  { id: 1, type: "deposit", user: "j.muthoni@gmail.com", detail: "Deposited $2,500 via M-Pesa", time: "2 min ago" },
  { id: 2, type: "signup", user: "kevin.otieno@gmail.com", detail: "New user registered", time: "12 min ago" },
  { id: 3, type: "alert", user: "system", detail: "Bot #4821 hit daily loss limit", time: "20 min ago" },
  { id: 4, type: "withdrawal", user: "amina.hassan@gmail.com", detail: "Withdrew $1,200", time: "45 min ago" },
  { id: 5, type: "signup", user: "brian.kip@gmail.com", detail: "New user registered", time: "1 hr ago" },
];

const activityIcon = (type: string) => {
  switch (type) {
    case "deposit": return <Wallet className="h-4 w-4 text-[#39ff88]" />;
    case "withdrawal": return <ArrowLeftRight className="h-4 w-4 text-[#ff4d6d]" />;
    case "alert": return <AlertTriangle className="h-4 w-4 text-[#f6ad55]" />;
    default: return <TrendingUp className="h-4 w-4 text-[#7f9cf5]" />;
  }
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
      <p className="text-sm text-gray-400 mb-6">Platform overview and recent activity.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map(({ label, value, icon: Icon, color, delta }) => (
          <div key={label} className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Icon className={`h-4 w-4 ${color}`} />
              {label}
            </div>
            <div className="text-xl md:text-2xl font-black text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{delta}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
        <h2 className="text-base font-bold text-white mb-4">Recent Activity</h2>
        <div className="flex flex-col gap-1">
          {RECENT_ACTIVITY.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-[#1a1f28] last:border-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/5">
                {activityIcon(a.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{a.detail}</div>
                <div className="text-xs text-gray-500">{a.user}</div>
              </div>
              <div className="text-xs text-gray-500 flex-shrink-0">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}