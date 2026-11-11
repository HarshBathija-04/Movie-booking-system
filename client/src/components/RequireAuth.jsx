import { ShieldAlert } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { EmptyState } from "./ui";

/** Sends guests to sign in (and back afterwards); with `admin`, also blocks non-staff accounts. */
export default function RequireAuth({ admin = false, children }) {
  const { user } = useAppContext();
  const location = useLocation();

  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== "admin") {
    return (
      <div className="page py-20">
        <EmptyState
          icon={ShieldAlert}
          title="Staff only"
          action={
            <Link to="/" className="btn-outline">
              Back to the lobby
            </Link>
          }
        >
          The admin console is limited to cinema staff accounts.
        </EmptyState>
      </div>
    );
  }
  return children;
}
