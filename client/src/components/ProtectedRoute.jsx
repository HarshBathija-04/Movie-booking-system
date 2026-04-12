import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
