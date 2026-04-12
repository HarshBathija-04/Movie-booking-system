import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminMoviesPage from "./pages/admin/AdminMoviesPage";
import AdminShowsPage from "./pages/admin/AdminShowsPage";
import AuthPage from "./pages/AuthPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import MoviesPage from "./pages/MoviesPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import SeatBookingPage from "./pages/SeatBookingPage";

const App = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
      <Route
        path="/book/:showId"
        element={
          <ProtectedRoute>
            <SeatBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings/:bookingId"
        element={
          <ProtectedRoute>
            <BookingDetailsPage />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route
      path="/admin"
      element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }
    >
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="movies" element={<AdminMoviesPage />} />
      <Route path="shows" element={<AdminShowsPage />} />
      <Route path="bookings" element={<AdminBookingsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
