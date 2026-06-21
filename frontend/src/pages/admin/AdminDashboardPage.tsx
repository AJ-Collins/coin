import { Users, Megaphone, ArrowLeftRight, Wallet, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

const activityIcon = (type: string) => {
  switch (type) {
    case "deposit":    return <Wallet className="h-4 w-4 text-[#39ff88]" />;
    case "withdrawal": return <ArrowLeftRight className="h-4 w-4 text-[#ff4d6d]" />;
    case "alert":      return <AlertTriangle className="h-4 w-4 text-[#f6ad55]" />;
    default:           return <TrendingUp className="h-4 w-4 text-[#7f9cf5]" />;
  }
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: activity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data } = await api.get("/admin/activity");
      return data;
    },
    refetchInterval: 30000,
  });

  const STATS = stats ? [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-[#7f9cf5]",
      delta: `+${stats.newUsersToday} today`,
    },
    {
      label: "Active Marketers",
      value: stats.activeMarketers.toString(),
      icon: Megaphone,
      color: "text-[#f6ad55]",
      delta: `${stats.activeMarketers} active`,
    },
    {
      label: "Trades Today",
      value: stats.tradesToday.toLocaleString(),
      icon: ArrowLeftRight,
      color: "text-[#39ff88]",
      delta: "completed trades",
    },
    {
      label: "Pending Deposits",
      value: `$${stats.pendingDepositsAmount.toFixed(2)}`,
      icon: Wallet,
      color: "text-[#4fd1c5]",
      delta: `${stats.pendingDepositsCount} pending`,
    },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
      <p className="text-sm text-gray-400 mb-6">Platform overview and recent activity.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4 animate-pulse">
                <div className="h-3 w-24 bg-[#1a1f28] rounded mb-3" />
                <div className="h-7 w-16 bg-[#1a1f28] rounded mb-2" />
                <div className="h-2 w-20 bg-[#1a1f28] rounded" />
              </div>
            ))
          : STATS.map(({ label, value, icon: Icon, color, delta }) => (
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

      {/* Recent Activity */}
      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
        <h2 className="text-base font-bold text-white mb-4">Recent Activity</h2>

        {activityLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-[#1a1f28]" />
                <div className="flex-1">
                  <div className="h-3 w-48 bg-[#1a1f28] rounded mb-1.5" />
                  <div className="h-2 w-32 bg-[#1a1f28] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No recent activity.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {activity.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center gap-3 py-2.5 border-b border-[#1a1f28] last:border-0"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 flex-shrink-0">
                  {activityIcon(a.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{a.detail}</div>
                  <div className="text-xs text-gray-500">{a.user}</div>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(a.time)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}