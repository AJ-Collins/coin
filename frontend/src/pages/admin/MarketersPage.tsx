import { MoreVertical, Megaphone } from "lucide-react";

// TODO: replace with GET /admin/marketers
const MARKETERS = [
  { id: "m1", email: "sarah.market@aiscalpingpro.com", referrals: 482, earnings: "$3,840.00", status: "active" },
  { id: "m2", email: "tony.growth@aiscalpingpro.com", referrals: 215, earnings: "$1,720.00", status: "active" },
  { id: "m3", email: "fatuma.ads@aiscalpingpro.com", referrals: 64, earnings: "$512.00", status: "pending" },
  { id: "m4", email: "dennis.promo@aiscalpingpro.com", referrals: 0, earnings: "$0.00", status: "suspended" },
];

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  suspended: "bg-rose-500/15 text-rose-400",
  pending: "bg-amber-500/15 text-amber-400",
};

export default function MarketersPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Marketers</h1>
      <p className="text-sm text-gray-400 mb-6">Manage marketer accounts and referral performance.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Megaphone className="h-4 w-4 text-[#f6ad55]" /> Total Marketers
          </div>
          <div className="text-2xl font-black text-white">{MARKETERS.length}</div>
        </div>
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-2">Total Referrals</div>
          <div className="text-2xl font-black text-white">
            {MARKETERS.reduce((sum, m) => sum + m.referrals, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-2">Total Payouts</div>
          <div className="text-2xl font-black text-[#39ff88]">$6,072.00</div>
        </div>
      </div>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[#1a1f28] text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Referrals</th>
              <th className="px-4 py-3">Earnings</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {MARKETERS.map((m) => (
              <tr key={m.id} className="border-b border-[#1a1f28] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{m.email}</td>
                <td className="px-4 py-3 text-gray-300">{m.referrals}</td>
                <td className="px-4 py-3 text-[#39ff88] font-semibold">{m.earnings}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusStyles[m.status]}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-gray-500 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}