import { Outlet } from "react-router-dom";
import DashboardNav from "./DashboardNav";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <DashboardNav />
      <Outlet />
    </div>
  );
}