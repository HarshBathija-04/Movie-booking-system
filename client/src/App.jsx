import { Clapperboard } from "lucide-react";
import { lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import RequireAuth from "./components/RequireAuth";
import { EmptyState, Skeleton } from "./components/ui";
import AuthPage from "./pages/AuthPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import MoviesPage from "./pages/MoviesPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import SeatBookingPage from "./pages/SeatBookingPage";

// Admin screens are only for staff, so keep them out of the customer bundle.
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminMoviesPage = lazy(() => import("./pages/admin/AdminMoviesPage"));
const AdminShowsPage = lazy(() => import("./pages/admin/AdminShowsPage"));
const AdminBookingsPage = lazy(() => import("./pages/admin/AdminBookingsPage"));

const NotFound = () => (
  <div className="page py-20">
    <EmptyState
      icon={Clapperboard}
      title="This reel is missing"
      action={
        <Link to="/" className="btn-primary">
          Back to the lobby
        </Link>
      }
    >
      The page you were looking for doesn&apos;t exist or has moved.
    </EmptyState>
  </div>
);

const protect = (el) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
        <Route path="/book/:showId" element={protect(<SeatBookingPage />)} />
        <Route path="/my-bookings" element={protect(<MyBookingsPage />)} />
        <Route path="/my-bookings/:bookingId" element={protect(<BookingDetailsPage />)} />
        <Route
          path="/admin"
          element={
            <RequireAuth admin>
              <Suspense
                fallback={
                  <div className="page py-10">
                    <Skeleton className="h-96" />
                  </div>
                }
              >
                <AdminLayout />
              </Suspense>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="movies" element={<AdminMoviesPage />} />
          <Route path="shows" element={<AdminShowsPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
