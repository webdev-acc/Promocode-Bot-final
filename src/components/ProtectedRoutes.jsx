import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAdmin";

export const ProtectedRoute = ({ children }) => {
  const { isUser } = useAuth();

  return !isUser ? children : <Navigate to="/" replace />;
};
