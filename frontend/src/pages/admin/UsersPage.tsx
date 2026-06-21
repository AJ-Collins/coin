import { useState } from "react";
import { Search, MoreVertical, ChevronLeft, ChevronRight, Plus, UserX, Trash2, Edit, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

const statusStyles: Record<string, string> = {
  ACTIVE:    "bg-emerald-500/15 text-emerald-400",
  SUSPENDED: "bg-rose-500/15 text-rose-400",
};

const roleStyles: Record<string, string> = {
  ADMIN:    "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  MARKETER: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  USER:     "bg-gray-500/15 text-gray-400 border border-gray-500/10",
};

const ITEMS_PER_PAGE = 10;

interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  accounts: { balance: string; currency: string }[];
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"create" | "edit" | "suspend" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formEmail, setFormEmail] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [formRole, setFormRole] = useState("USER");
  const [formPassword, setFormPassword] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  // Debounce search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => {
      setDebouncedSearch(e.target.value);
    }, 400);
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch],
    queryFn: async () => {
      const { data } = await api.get("/admin/users", {
        params: debouncedSearch ? { search: debouncedSearch } : {},
      });
      return data as AdminUser[];
    },
  });

  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const activePage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/users", data),
    onSuccess: () => { invalidate(); setModalType(null); setApiError(null); },
    onError: (e: any) => setApiError(e?.response?.data?.error || "Failed to create user"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/admin/users/${id}`, data),
    onSuccess: () => { invalidate(); setModalType(null); setApiError(null); },
    onError: (e: any) => setApiError(e?.response?.data?.error || "Failed to update user"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
    onSuccess: () => { invalidate(); setModalType(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { invalidate(); setModalType(null); },
  });

  const openCreateModal = () => {
    setFormEmail(""); setFormBalance("0"); setFormRole("USER"); setFormPassword("");
    setApiError(null);
    setModalType("create");
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setFormEmail(user.email);
    setFormBalance(String(Number(user.accounts[0]?.balance ?? 0)));
    setFormRole(user.role);
    setFormPassword("");
    setApiError(null);
    setModalType("edit");
    setActiveMenuId(null);
  };

  const openActionModal = (user: AdminUser, type: "suspend" | "delete") => {
    setSelectedUser(user);
    setModalType(type);
    setActiveMenuId(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === "create") {
      createMutation.mutate({
        email: formEmail,
        password: formPassword,
        role: formRole,
        balance: parseFloat(formBalance) || 0,
      });
    } else if (modalType === "edit" && selectedUser) {
      const payload: any = { email: formEmail, role: formRole, balance: parseFloat(formBalance) || 0 };
      if (formPassword) payload.password = formPassword;
      updateMutation.mutate({ id: selectedUser.id, data: payload });
    }
  };

  const handleConfirmAction = () => {
    if (!selectedUser) return;
    if (modalType === "suspend") toggleStatusMutation.mutate(selectedUser.id);
    if (modalType === "delete") deleteMutation.mutate(selectedUser.id);
  };

  const isPending = createMutation.isPending || updateMutation.isPending
    || toggleStatusMutation.isPending || deleteMutation.isPending;

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
          <Plus className="h-4 w-4" /> Create User
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

      <div className="bg-[#0d0f17] border border-[#1a1f28] rounded-xl overflow-x-auto min-h-[800px]">
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1f28]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-[#1a1f28] rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => {
                const balance = Number(u.accounts[0]?.balance ?? 0);
                const currency = u.accounts[0]?.currency ?? "USD";
                return (
                  <tr key={u.id} className="border-b border-[#1a1f28] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md ${roleStyles[u.role] || roleStyles.USER}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(balance)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusStyles[u.status] || statusStyles.ACTIVE}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}
                        className="text-gray-500 hover:text-white p-1"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuId === u.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                          <div className="absolute right-4 mt-1 w-44 bg-[#090b11] border border-[#1a1f28] rounded-lg shadow-xl py-1 z-20 text-left">
                            <button onClick={() => openEditModal(u)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white">
                              <Edit className="h-3.5 w-3.5 text-blue-400" /> Edit Details
                            </button>
                            <button onClick={() => openActionModal(u, "suspend")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white">
                              <UserX className="h-3.5 w-3.5 text-amber-400" />
                              {u.status === "SUSPENDED" ? "Unsuspend User" : "Suspend User"}
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
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1f28] bg-[#090b11]">
          <div className="text-xs text-gray-400">
            Showing <span className="text-white font-medium">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="text-white font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> of{" "}
            <span className="text-white font-medium">{totalItems}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={activePage === 1}
              className="p-1.5 rounded border border-[#1a1f28] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400 px-1">
              Page <span className="text-white font-medium">{activePage}</span> of {totalPages}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={activePage === totalPages}
              className="p-1.5 rounded border border-[#1a1f28] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0f17] border border-[#1a1f28] w-full max-w-md rounded-xl p-6 shadow-2xl">

            {(modalType === "create" || modalType === "edit") && (
              <form onSubmit={handleSaveUser} className="space-y-4">
                <h3 className="text-lg font-bold text-white">
                  {modalType === "create" ? "Create New User" : "Update User Details"}
                </h3>

                {apiError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">
                    {apiError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                    className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">User Role</label>
                  <select value={formRole} onChange={e => setFormRole(e.target.value)}
                    className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40 appearance-none cursor-pointer">
                    <option value="USER">User</option>
                    <option value="MARKETER">Marketer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Balance (USD)</label>
                  <input required type="number" step="0.01" min="0" value={formBalance} onChange={e => setFormBalance(e.target.value)}
                    className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {modalType === "create" ? "Password" : "New Password (leave blank to keep)"}
                  </label>
                  <input type="password" placeholder="••••••••" required={modalType === "create"}
                    value={formPassword} onChange={e => setFormPassword(e.target.value)}
                    className="w-full bg-[#05070a] border border-[#1a1f28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#39ff88]/40" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                  <button type="submit" disabled={isPending}
                    className="bg-[#39ff88] text-[#05070a] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#5dffa1] flex items-center gap-2 disabled:opacity-50">
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {(modalType === "suspend" || modalType === "delete") && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  {modalType === "suspend" ? "Toggle Account Access" : "Permanent Account Deletion"}
                </h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to{" "}
                  {modalType === "suspend"
                    ? selectedUser?.status === "SUSPENDED" ? "unsuspend" : "suspend"
                    : "delete"}{" "}
                  <span className="text-white font-medium">{selectedUser?.email}</span>?
                  {modalType === "delete" && " This action is permanent and cannot be reversed."}
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setModalType(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                  <button onClick={handleConfirmAction} disabled={isPending}
                    className={`font-bold text-sm px-4 py-2 rounded-lg text-white flex items-center gap-2 disabled:opacity-50 ${
                      modalType === "delete" ? "bg-rose-600 hover:bg-rose-500" : "bg-amber-600 hover:bg-amber-500"
                    }`}>
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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