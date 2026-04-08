/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auth Slice - Redux state management for company user authentication
 *
 * PURPOSE:
 * - Manages authentication state for company users (NOT super admins - see adminSlice)
 * - Handles localStorage/cookie persistence for cross-subdomain auth
 * - Provides login/logout actions for company users
 *
 * KEY STORAGE KEYS:
 * - localStorage: "user", "token", "company"
 * - localStorage (admin): "admin_user", "admin_token" (fallback for compatibility)
 * - cookies: "user", "token", "company" (with domain for cross-subdomain)
 *
 * NOTE: Super admin authentication is handled by adminSlice, not this slice.
 */

import type { User } from "@/shared/types/auth/users.types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// ============================================================================
// TYPES
// ============================================================================

interface Company {
  id: string;
  name: string;
  subdomain: string;
  dbType: "shared" | "dedicated";
  [key: string]: unknown;
  domain?: string; // Optional domain field for cookie handling (added for flexibility)
}

interface AuthState {
  /** Current authenticated company user */
  user: User | null;
  /** JWT token for API requests */
  token: string | null;
  /** Company information (multi-tenant) */
  company: Company | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  // Company user credentials (primary)
  USER: "user",
  TOKEN: "token",
  COMPANY: "company",

  // Admin credentials (fallback - managed by adminSlice)
  ADMIN_USER: "admin_user",
  ADMIN_TOKEN: "admin_token",

  // Legacy keys to clean up
  COMPANY_DOMAIN: "company_domain",
  COMPANY_ID: "companyId",
} as const;

const COOKIE_DOMAINS = {
  LVH_ME: ".lvh.me", // For local development with subdomains
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determines if the current domain requires special cookie handling
 * @returns The cookie domain or undefined for production
 */
const getCookieDomain = (): string | undefined => {
  const hostname = window.location.hostname;
  const isLvhMeDomain = hostname === "lvh.me" || hostname.endsWith(".lvh.me");
  return isLvhMeDomain ? COOKIE_DOMAINS.LVH_ME : undefined;
};

/**
 * Standard cookie options for cross-subdomain authentication
 */
const getCookieOptions = () => ({
  domain: getCookieDomain(),
  path: "/" as const,
  sameSite: "lax" as const,
  secure: window.location.protocol === "https:" && !window.location.hostname.includes("lvh.me"),
});

/**
 * Safely parses JSON with error handling
 */
const safeParseJSON = <T = any>(jsonString: string | null, fallback: T | null = null): T | null => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("[Auth] ❌ Failed to parse JSON:", error);
    return fallback;
  }
};

/**
 * Loads user from storage with fallback chain:
 * 1. localStorage user (company user - priority)
 * 2. localStorage admin_user (super admin - fallback)
 * 3. cookie user
 */
const loadUserFromStorage = (): User | null => {
  console.log("[Auth Init] 🔍 Loading user from storage...");

  // Priority 1: Company user from localStorage
  const localStorageUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (localStorageUser) {
    const user = safeParseJSON<User>(localStorageUser);
    if (user) {
      console.log("[Auth Init] ✅ Loaded company user:", user.email);
      return user;
    }
  }

  // Priority 2: Admin user from localStorage (fallback)
  const adminUser = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
  if (adminUser) {
    const user = safeParseJSON<User>(adminUser);
    if (user) {
      console.log("[Auth Init] ✅ Loaded admin user:", user.email);
      return user;
    }
  }

  // Priority 3: User from cookie
  const userCookie = Cookies.get(STORAGE_KEYS.USER);
  if (userCookie) {
    const user = safeParseJSON<User>(userCookie);
    if (user) {
      console.log("[Auth Init] ✅ Loaded user from cookie:", user.email);
      return user;
    }
  }

  console.log("[Auth Init] ❌ No user found");
  return null;
};

/**
 * Loads token from storage with fallback chain:
 * 1. localStorage token (company user - priority)
 * 2. localStorage admin_token (super admin - fallback)
 * 3. cookie token
 */
const loadTokenFromStorage = (): string | null => {
  console.log("[Auth Init] 🔍 Loading token from storage...");

  // Priority 1: Company token from localStorage
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    console.log("[Auth Init] ✅ Loaded company token");
    return token;
  }

  // Priority 2: Admin token from localStorage
  const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (adminToken) {
    console.log("[Auth Init] ✅ Loaded admin token");
    return adminToken;
  }

  // Priority 3: Token from cookie
  const cookieToken = Cookies.get(STORAGE_KEYS.TOKEN);
  if (cookieToken) {
    console.log("[Auth Init] ✅ Loaded token from cookie");
    return cookieToken;
  }

  console.log("[Auth Init] ❌ No token found");
  return null;
};

/**
 * Loads company from storage with fallback chain:
 * 1. localStorage company
 * 2. cookie company
 */
const loadCompanyFromStorage = (): any | null => {
  console.log("[Auth Init] 🔍 Loading company from storage...");

  // Priority 1: Company from localStorage
  const localStorageCompany = localStorage.getItem(STORAGE_KEYS.COMPANY);
  if (localStorageCompany) {
    const company = safeParseJSON(localStorageCompany);
    if (company) {
      console.log("[Auth Init] ✅ Loaded company:", company.name);
      return company;
    }
  }

  // Priority 2: Company from cookie
  const companyCookie = Cookies.get(STORAGE_KEYS.COMPANY);
  if (companyCookie) {
    const company = safeParseJSON(companyCookie);
    if (company) {
      console.log("[Auth Init] ✅ Loaded company from cookie:", company.name);
      return company;
    }
  }

  console.log("[Auth Init] ℹ️ No company found (user may not be assigned)");
  return null;
};

/**
 * Initializes the auth state from storage (localStorage + cookies)
 */
const getInitialState = (): AuthState => {
  console.log("[Auth Init] ================================================");
  console.log("[Auth Init] 🚀 Initializing Auth State");
  console.log("[Auth Init] Hostname:", window.location.hostname);
  console.log("[Auth Init] Cookie Domain:", getCookieDomain() || "(none)");

  const user = loadUserFromStorage();
  const token = loadTokenFromStorage();
  const company = loadCompanyFromStorage();

  console.log("[Auth Init] -----------------------------------------------");
  console.log("[Auth Init] 📊 Final State:");
  console.log("[Auth Init]   - User:", user?.email || "(none)");
  console.log("[Auth Init]   - Token:", token ? "(present)" : "(none)");
  console.log("[Auth Init]   - Company:", company?.name || "(none)");
  console.log("[Auth Init] ================================================");

  return { user, token, company };
};

// ============================================================================
// REDUX SLICE
// ============================================================================

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    /**
     * Stores authentication credentials in both Redux state and persistent storage
     * @param payload.user - The user object
     * @param payload.token - JWT token
     * @param payload.company - Company information (optional)
     */
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; company?: Company }>
    ) => {
      const { user, token, company } = action.payload;

      console.log("[Auth] 🔐 Storing credentials");
      console.log("[Auth]   - User:", user.email);
      console.log("[Auth]   - Company:", company?.name || "(none)");

      // Update Redux state
      state.user = user;
      state.token = token;
      state.company = company || null;

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      if (company) {
        localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
      }

      // Store in cookies (for cross-subdomain access)
      const cookieOptions = getCookieOptions();
      Cookies.set(STORAGE_KEYS.TOKEN, token, cookieOptions);
      Cookies.set(STORAGE_KEYS.USER, JSON.stringify(user), cookieOptions);
      if (company) {
        Cookies.set(STORAGE_KEYS.COMPANY, JSON.stringify(company), cookieOptions);
      }

      console.log("[Auth] ✅ Credentials stored successfully");
    },

    /**
     * Clears all authentication data from Redux state and persistent storage
     * Also clears admin credentials to ensure clean logout
     */
    logout: (state) => {
      console.log("[Auth] 🚪 Logging out user");

      // Clear Redux state
      state.user = null;
      state.token = null;
      state.company = null;

      // Clear localStorage (both company and admin)
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear cookies (both company and admin)
      const cookieOptions = { ...getCookieOptions(), path: "/" };
      Object.values(STORAGE_KEYS).forEach((key) => {
        Cookies.remove(key, cookieOptions);
      });

      console.log("[Auth] ✅ Logout complete - all credentials cleared");
    },
  },

  /**
   * Extra reducers for handling async actions from RTK Query
   */
  extraReducers: (builder) => {
    // Update user when authUser query completes
    builder.addMatcher(
      (action) =>
        action.type.includes("executeQuery/fulfilled") &&
        action.meta?.arg?.endpointName === "authUser",
      (state, action: PayloadAction<{ data: { user: User } }>) => {
        if (action.payload?.data?.user) {
          console.log("[Auth] 🔄 Updating user from API response");
          state.user = action.payload.data.user;
        }
      }
    );
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { setCredentials, logout } = authSlice.actions;
export { authSlice };
export default authSlice.reducer;

/**
 * SELECTOR HELPERS
 * Usage: const user = useAppSelector(selectCurrentUser);
 */
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsLoggedIn = (state: { auth: AuthState }) => !!state.auth.user;
export const selectCurrentCompany = (state: { auth: AuthState }) => state.auth.company;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
