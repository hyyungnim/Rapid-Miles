import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "../contexts/AuthContext";
import { LandingPage } from "../pages/LandingPage";
import { AdminAuth } from "../pages/AdminAuth";
import { CustomerAuth } from "../pages/CustomerAuth";
import { DriverAuth } from "../pages/DriverAuth";
import { CustomerDashboard } from "../pages/CustomerDashboard";
import { DriverDashboard } from "../components/driver/DriverDashboard";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { ProfilePage } from "../pages/ProfilePage";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminAuth />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/customer/auth" element={<CustomerAuth />} />
          <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/profile" element={<ProtectedRoute role="customer"><ProfilePage role="customer" /></ProtectedRoute>} />
          <Route path="/driver" element={<DriverAuth />} />
          <Route path="/driver/dashboard" element={<ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/profile" element={<ProtectedRoute role="driver"><ProfilePage role="driver" /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
