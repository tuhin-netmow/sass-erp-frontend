/**
 * Authentication Routes
 * Public pages for login, registration, password recovery
 */

import type { RouteObject } from "react-router";

// Import pages directly
import Login from "@/auth/pages/Login";
import Register from "@/auth/pages/Register";
import RegistrationSuccess from "@/auth/pages/RegistrationSuccess";
import ForgotPassword from "@/auth/pages/ForgotPassword";
import ResetPassword from "@/auth/pages/ResetPassword";
import AuthCallback from "@/auth/pages/AuthCallback";
import { AdminLogin } from "@/admin/pages";

export const authRoutes: RouteObject[] = [
  { path: "login", element: <Login /> },
  { path: "company-login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "registration/success", element: <RegistrationSuccess /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "reset-password", element: <ResetPassword /> },
  { path: "auth/callback", element: <AuthCallback /> },
  { path: "admin/login", element: <AdminLogin /> },
];
