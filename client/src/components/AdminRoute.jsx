import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const AdminRoute = ({ children }) => {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
