import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: JSX.Element;
  role?: "student" | "mentor" | "admin";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading) return children; // allow suspense-less render; pages can show own spinners
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // If this user is admin, restrict them to admin-only area
  if (profile?.is_admin && role !== "admin") return <Navigate to="/admin" replace />;
  if (role === "admin" && !profile?.is_admin) return <Navigate to={profile?.role === "mentor" ? "/mentor/dashboard" : "/student/dashboard"} replace />;
  if (role && role !== "admin" && profile?.role !== role) return <Navigate to={profile?.role === "mentor" ? "/mentor/dashboard" : "/student/dashboard"} replace />;
  return children;
}


