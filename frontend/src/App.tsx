import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider} from "./lib/auth";
import ProtectedRoute from "./components/ProtectedRoute";

// Public
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// User
import DashboardLayout from "./components/dashboard/Layout";
import DashboardPage from "./pages/DashboardPage";
import BotsPage from "./pages/BotsPage";
import BotDetailPage from "./pages/BotDetailPage";
import ExchangesPage from "./pages/ExchangesPage";

// Admin
// import AdminLayout from "./components/admin/Layout";
// import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
// import UsersPage from "./pages/admin/UsersPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected */}
            {/* User-only */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/bots" element={<BotsPage />} />
                <Route path="/bots/:id" element={<BotDetailPage />} />
                <Route path="/exchanges" element={<ExchangesPage />} />
              </Route>
            </Route>

            {/* Admin-only */}
            {/* <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
              </Route>
            </Route> */}
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
