import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <AdminNav />
      <div className="px-4 md:px-6 py-6">
        <Outlet />
      </div>
    </div>
  );
}