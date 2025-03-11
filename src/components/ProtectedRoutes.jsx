import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAdmin";

export const ProtectedRoute = ({ children }) => {
  const currentUser = useAuth();

  return currentUser.adminAccess ? children : <Navigate to="/" replace />;
};
