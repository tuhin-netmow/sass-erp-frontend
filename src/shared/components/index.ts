/**
 * Shared Components Index
 * Central export point for all shared components
 */

// Auth Components
export { LoginForm } from "./auth/LoginForm";
export { SignupForm as RegisterForm } from "./auth/RegisterForm";
export { UniversalLoginForm } from "./auth/UniversalLoginForm";
export { PermissionGate } from "./auth/PermissionGate";
export { TenantOnboardForm } from "./auth/TenantOnboardForm";

// Common Components
export { SignOutDialog } from "./common/sign-out-dialog";
export { ConfirmDialog } from "./common/confirm-dialog";
export { BackButton } from "./common/BackButton";
export { MapEmbed } from "./common/MapEmbed";
export { GoogleMapEmbed } from "./common/GoogleMapEmbed";
export { PrintButton } from "./common/PrintButton";
export { ThemeSwitch } from "./common/theme-switch";

// Route Guards
export * from "./routeGuards";
