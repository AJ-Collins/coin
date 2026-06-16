import { useState } from "react";
import { Search, MoreVertical, ChevronLeft, ChevronRight, Plus, UserX, Trash2, Edit } from "lucide-react";

// TODO: replace with GET /admin/users
const INITIAL_USERS = [
  { id: "u1", email: "j.muthoni@gmail.com", role: "Admin", status: "active", balance: "$4,250.00", joined: "2026-01-12" },
  { id: "u2", email: "kevin.otieno@gmail.com", role: "User", status: "active", balance: "$0.00", joined: "2026-06-10" },
  { id: "u3", email: "amina.hassan@gmail.com", role: "Marketer", status: "suspended", balance: "$1,200.00", joined: "2025-11-03" },
  { id: "u4", email: "brian.kip@gmail.com", role: "User", status: "active", balance: "$890.50", joined: "2026-06-12" },
  { id: "u5", email: "linda.wanjiru@gmail.com", role: "User", status: "pending", balance: "$0.00", joined: "2026-06-13" },
];

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  suspended: "bg-rose-500/15 text-rose-400",
  pending: "bg-amber-500/15 text-amber-400",
};

// Distinct styling for roles
const roleStyles: Record<string, string> = {
  Admin: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  Marketer: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  User: "bg-gray-500/15 text-gray-400 border border-gray-500/10",
};

const ITEMS_PER_PAGE = 10;

type User = typeof INITIAL_USERS[0];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"create" | "edit" | "suspend" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formEmail, setFormEmail] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [formRole, setFormRole] = useState("User");
  const [formPassword, setFormPassword] = useState("");

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const activePage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Action Triggers
  const openCreateModal = () => {
    setFormEmail("");
    setFormBalance("$0.00");
    setFormRole("User");
    setFormPassword("");
    setModalType("create");
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormEmail(user.email);
    setFormBalance(user.balance);
    setFormRole(user.role);
    setFormPassword(""); // Kept blank unless changing
    setModalType("edit");
    setActiveMenuId(null);
  };

  const openActionModal = (user: User, type: "suspend" | "delete") => {
    setSelectedUser(user);
    setModalType(type);
    setActiveMenuId(null);
  };

  // Form Submit Handlers
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === "create") {
      const newUser: User = {
        id: "u" + (users.length + 1),
        email: formEmail,
        role: formRole,
        status: "active",
        balance: formBalance.startsWith("$") ? formBalance : `$${formBalance}`,
        joined: new Date().toISOString().split("T")[0]
      };
      setUsers([newUser, ...users]);
    } else if (modalType === "edit" && selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, email: formEmail, balance: formBalance, role: formRole } : u));
    }
    setModalType(null);
  };

  const handleConfirmAction = () => {
    if (!selectedUser) return;
    if (modalType === "suspend") {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u));
    } else if (modalType === "delete") {
      setUsers(users.filter(u => u.id !== selectedUser.id));
    }
    setModalType(null);
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Users</h1>
          <p className="text-sm text-gray-400">Manage platform users.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#39ff88] text-[#05070a] font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#5dffa1] transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={handleSearchChange}
          type="text"
          placeholder="Search by email..."
          className="w-full bg-[#0d0f17] border border-[#1a1f28] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#39ff88]/40"
        />
      </div>

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[#1a1f28] text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => (
                <tr key={u.id} className="border-b border-[#1a1f28] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md ${roleStyles[u.role] || roleStyles.User}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{u.balance}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusStyles[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.joined}</td>
                  <td className="px-4 py-3 text-right relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}
                      className="text-gray-500 hover:text-white p-1"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {/* Context Action Menu Dropdown */}
                    {activeMenuId === u.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-4 mt-1 w-44 bg-[#090b11] border border-[#1a1f28] rounded-lg shadow-xl py-1 z-20 text-left">
                          <button onClick={() => openEditModal(u)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white">
                            <Edit className="h-3.5 w-3.5 text-blue-400" /> Edit Details
                          </button>
                          <button onClick={() => openActionModal(u, "suspend")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white">
                            <UserX className="h-3.5 w-3.5 text-amber-400" /> {u.status === "suspended" ? "Unsuspend User" : "Suspend User"}
                          </button>
                          <div className="border-t border-[#1a1f28] my-1" />
                          <button onClick={() => openActionModal(u, "delete")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10">
                            <Trash2 className="h-3.5 w-3.5" /> Delete User
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION PANEL */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1f28] bg-[#090b11]">
          <div className="text-xs text-gray-400">
            Showing <span className="text-white font-medium">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="text-white font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
            <span className="text-white font-medium">{totalItems}</span> users
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={activePage === 1}
              className="p-1.5 rounded border border-[#1a1f28] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400 px-1">
              Page <span className="text-white font-medium">{activePage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={activePage === totalPages}
              className="p-1.5 rounded border border-[#1a1f28] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL SYSTEM LAYER */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0f17] border border-[#1a1f28] w-full max-w-md rounded-xl p-6 shadow-2xl">
            
            {/* Form Modals (Create & Edit) */}
            {(modalType === "create" || modalType === "edit") && (
              <form onSubmit={handleSaveUser} className="space-y-4">
                <h3 className="text-lg font-bold text-white">
                  {modalType === "create" ? "Create New User" : "Update User Details"}
                </h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">User Role</label>
                  <select 
                    value={formRole} 
                    onChange={e => setFormRole(e.target.value)} 
                    className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40 appearance-none cursor-pointer"
                  >
                    <option value="User">User</option>
                    <option value="Marketer">Marketer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Balance</label>
                  <input required type="text" value={formBalance} onChange={e => setFormBalance(e.target.value)} className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {modalType === "create" ? "Password" : "New Password (Leave blank to keep old)"}
                  </label>
                  <input type="password" placeholder="••••••••" required={modalType === "create"} value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                  <button type="submit" className="bg-[#39ff88] text-[#05070a] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#5dffa1]">Save Changes</button>
                </div>
              </form>
            )}

            {/* Action Confirmation Modals (Suspend & Delete) */}
            {(modalType === "suspend" || modalType === "delete") && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  {modalType === "suspend" ? "Toggle Account Access" : "Permanent Account Deletion"}
                </h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to {modalType === "suspend" ? (selectedUser?.status === "suspended" ? "unsuspend" : "suspend") : "delete"}{" "}
                  <span className="text-white font-medium">{selectedUser?.email}</span>? 
                  {modalType === "delete" && " This action is permanent and cannot be reversed."}
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setModalType(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                  <button 
                    onClick={handleConfirmAction} 
                    className={`font-bold text-sm px-4 py-2 rounded-lg text-white ${modalType === "delete" ? "bg-rose-600 hover:bg-rose-500" : "bg-amber-600 hover:bg-amber-500"}`}
                  >
                    Confirm Action
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}