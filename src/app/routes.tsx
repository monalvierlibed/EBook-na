import { Navigate, Outlet, createBrowserRouter, useLocation } from "react-router";
import { CustomerLayout } from "./components/layouts/CustomerLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { AuthLayout } from "./components/layouts/AuthLayout";
import { useAuth } from "./context/AuthContext";

// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { AuthCallback } from "./pages/auth/AuthCallback";

// Customer Pages
import { Home } from "./pages/customer/Home";
import { RoomSearch } from "./pages/customer/RoomSearch";
import { RoomDetails } from "./pages/customer/RoomDetails";
import { Booking } from "./pages/customer/Booking";
import { BookingHistory } from "./pages/customer/BookingHistory";
import { Notifications } from "./pages/customer/Notifications";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { RoomManagement } from "./pages/admin/RoomManagement";
import { ReservationManagement } from "./pages/admin/ReservationManagement";
import { CustomerManagement } from "./pages/admin/CustomerManagement";
import { Reports } from "./pages/admin/Reports";

const getUserRole = (role: unknown): string => {
  if (typeof role !== "string") {
    return "customer";
  }
  return role.toLowerCase();
};

const RequireAuth = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

const RequireRole = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const roleFromProfile = (profile as { role?: unknown } | null)?.role;
  const roleFromMetadata = user.app_metadata?.role ?? user.user_metadata?.role;
  const userRole = getUserRole(roleFromProfile ?? roleFromMetadata);
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const RequireAdmin = () => <RequireRole allowedRoles={["admin"]} />;

export const router = createBrowserRouter([
  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "callback", Component: AuthCallback },
    ],
  },
  {
    path: "/",
    Component: CustomerLayout,
    children: [
      { index: true, Component: Home },
      { path: "search", Component: RoomSearch },
      { path: "room/:id", Component: RoomDetails },
      { path: "hotel/:hotelId", Component: RoomDetails },
      {
        Component: RequireAuth,
        children: [
          { path: "booking/:roomId", Component: Booking },
          { path: "bookings", Component: BookingHistory },
          { path: "notifications", Component: Notifications },
        ],
      },
    ],
  },
  {
    path: "/admin",
    Component: RequireAdmin,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "rooms", Component: RoomManagement },
          { path: "reservations", Component: ReservationManagement },
          { path: "customers", Component: CustomerManagement },
          { path: "reports", Component: Reports },
        ],
      },
    ],
  },
]);
