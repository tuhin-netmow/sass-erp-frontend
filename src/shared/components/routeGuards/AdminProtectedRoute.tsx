import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "@/store/store";

export default function AdminProtectedRoute() {
  const adminToken = localStorage.getItem("admin_token");
  const admin = useAppSelector((state) => state.admin.admin);

  if (!adminToken || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
