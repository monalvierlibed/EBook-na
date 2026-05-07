import { createBrowserRouter } from "react-router";
import { CustomerLayout } from "./components/layouts/CustomerLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { AuthLayout } from "./components/layouts/AuthLayout";

// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";

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

export const router = createBrowserRouter([
  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
    ],
  },
  {
    path: "/",
    Component: CustomerLayout,
    children: [
      { index: true, Component: Home },
      { path: "search", Component: RoomSearch },
      { path: "room/:id", Component: RoomDetails },
      { path: "booking/:roomId", Component: Booking },
      { path: "bookings", Component: BookingHistory },
      { path: "notifications", Component: Notifications },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "rooms", Component: RoomManagement },
      { path: "reservations", Component: ReservationManagement },
      { path: "customers", Component: CustomerManagement },
      { path: "reports", Component: Reports },
    ],
  },
]);
